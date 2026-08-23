/**
 * ============================================================
 * DESTINY DRAW — LOGGER v2.0
 * ============================================================
 * ¿QUÉ HACE?
 *   Intercepta en tiempo real la ejecución de todos los métodos
 *   de los módulos globales de la app sin modificar ningún archivo
 *   fuente. Registra: módulo, método, argumentos resumidos,
 *   resultado, tiempo de ejecución y errores.
 *
 * ¿QUÉ PUEDE HACER UNA IA (o programador) CON ESTE LOG?
 *   - Detectar métodos que nunca se ejecutan (código muerto).
 *   - Identificar rutas lentas (tiempo de ejecución alto).
 *   - Rastrear el orden exacto de llamadas al cambiar de pestaña.
 *   - Localizar errores con su stack y el contexto previo.
 *   - Verificar que el flujo de inicialización es correcto.
 *   - Comparar sesiones: "funcionaba antes, ahora falla aquí".
 *   - Detectar llamadas circulares o en bucle infinito.
 *   - Auditar qué claves de localStorage se leen/escriben.
 *
 * USO:
 *   DDLogger.exportReport()  → descarga el reporte .txt
 *   DDLogger.getLogs()       → array de entradas en memoria
 *   DDLogger.clear()         → limpia el buffer
 *   DDLogger.enable/disable  → activa/desactiva en caliente
 * ============================================================
 */

(function () {
    'use strict';

    // ── Configuración ───────────────────────────────────────
    const CFG = {
        MAX_ENTRIES:   800,    // Máx entradas en memoria
        MAX_ARG_LEN:   120,    // Máx chars al serializar un argumento
        SLOW_MS:       150,    // Umbral "llamada lenta" en ms
        LOG_CONSOLE:   true,   // Imprimir en consola del navegador
        ENABLED:       true,   // Se puede desactivar en caliente
    };

    // Módulos globales a interceptar (según Reporte técnico)
    const TARGETS = [
        'Navigation', 'Shortcuts', 'ContentManager', 'TabIntro',
        'ConfigManager', 'SpecialtyAnalyzer', 'NomenclatureAnalyzer',
        'Buscador', 'CardViewer', 'Favoritas',
        'Deck', 'Combos', 'Banlist', 'Engines',
        'Matchups', 'Duelista',
        'Estadisticas',
        'Winrate', 'Torneo', 'DueloEnVivo', 'Hipergeometria', 'CounterSim', 'Gauntlet',
        'DecklistsData',
        'ZonaPractica', 'Experimentacion',
        'Formacion', 'Meta', 'Config', 'Welcome', 'MusicPlayer', 'HelpPanel', 'TestDuelo',
        'DefaultData',
        'Lobby',
    ];

    // ── Estado interno ──────────────────────────────────────
    const _buffer = [];       // Buffer circular de entradas
    const _stats  = {};       // { 'Modulo.metodo': { calls, totalMs, errors } }
    let   _seq    = 0;        // Número de secuencia global
    let   _sessionStart = new Date();

    // ── Helpers ─────────────────────────────────────────────
    function _ts() {
        return new Date().toISOString().replace('T', ' ').slice(0, 23);
    }

    function _elapsed(start) {
        return (performance.now() - start).toFixed(2);
    }

    function _serialize(val) {
        if (val === null)      return 'null';
        if (val === undefined) return 'undefined';
        try {
            if (typeof val === 'function') return '[Function]';
            if (val instanceof HTMLElement) return `[HTMLElement <${val.tagName.toLowerCase()}>]`;
            if (val instanceof Event)       return `[Event ${val.type}]`;
            if (Array.isArray(val))         return `Array(${val.length})`;
            if (typeof val === 'object') {
                const s = JSON.stringify(val);
                return s.length > CFG.MAX_ARG_LEN ? s.slice(0, CFG.MAX_ARG_LEN) + '…' : s;
            }
            const s = String(val);
            return s.length > CFG.MAX_ARG_LEN ? s.slice(0, CFG.MAX_ARG_LEN) + '…' : s;
        } catch (_) { return '[unserializable]'; }
    }

    function _push(entry) {
        if (_buffer.length >= CFG.MAX_ENTRIES) _buffer.shift();
        _buffer.push(entry);
    }

    function _updateStats(key, ms, isError) {
        if (!_stats[key]) _stats[key] = { calls: 0, totalMs: 0, errors: 0 };
        _stats[key].calls++;
        _stats[key].totalMs += parseFloat(ms);
        if (isError) _stats[key].errors++;
    }

    // ── Wrapping ─────────────────────────────────────────────
    function _wrapObject(objName, obj) {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] !== 'function') return;
            if (key.startsWith('_log') || key === 'exportReport') return; // evitar recursión

            const original = obj[key];
            const label    = `${objName}.${key}`;

            obj[key] = function (...args) {
                if (!CFG.ENABLED) return original.apply(this, args);

                const seq   = ++_seq;
                const t0    = performance.now();
                const argsS = args.map(_serialize).join(', ');
                let   result, error, ms;

                try {
                    result = original.apply(this, args);

                    // Si devuelve Promise, instrumentarla también
                    if (result && typeof result.then === 'function') {
                        return result.then(
                            res => {
                                ms = _elapsed(t0);
                                _record(seq, label, argsS, '[Promise resolved]', ms, null);
                                return res;
                            },
                            err => {
                                ms = _elapsed(t0);
                                _record(seq, label, argsS, null, ms, err);
                                throw err;
                            }
                        );
                    }

                    ms = _elapsed(t0);
                    _record(seq, label, argsS, result, ms, null);
                    return result;

                } catch (e) {
                    ms    = _elapsed(t0);
                    error = e;
                    _record(seq, label, argsS, null, ms, error);
                    throw e;
                }
            };
        });
    }

    function _record(seq, label, argsS, result, ms, error) {
        const isError = !!error;
        const isSlow  = parseFloat(ms) >= CFG.SLOW_MS;

        const entry = {
            seq,
            ts:     _ts(),
            label,
            args:   argsS || '—',
            ms:     parseFloat(ms),
            ok:     !isError,
            slow:   isSlow,
            error:  error ? (error.message || String(error)) : null,
            stack:  error ? (error.stack   || null)          : null,
        };

        _push(entry);
        _updateStats(label, ms, isError);

        if (CFG.LOG_CONSOLE) {
            const icon  = isError ? '🔴' : isSlow ? '🟡' : '🟢';
            const style = isError ? 'color:#ff6b6b' : isSlow ? 'color:#fdcb6e' : 'color:#55efc4';
            const msg   = `${icon} [${seq}] ${label}(${argsS.slice(0, 60)}) → ${ms}ms`;
            if (isError) {
                console.groupCollapsed(`%c${msg}`, style);
                console.error(error);
                console.groupEnd();
            } else if (isSlow) {
                console.groupCollapsed(`%c${msg}`, style);
                console.warn(`Slow call: ${ms}ms`);
                console.groupEnd();
            } else {
                console.debug(`%c${msg}`, style);
            }
        }
    }

    // ── Errores globales ─────────────────────────────────────
    window.addEventListener('error', function (e) {
        const entry = {
            seq:   ++_seq,
            ts:    _ts(),
            label: 'GLOBAL_ERROR',
            args:  e.filename ? `${e.filename}:${e.lineno}` : '—',
            ms:    0,
            ok:    false,
            slow:  false,
            error: e.message,
            stack: e.error?.stack || null,
        };
        _push(entry);
        if (CFG.LOG_CONSOLE) console.error('%c🔴 GLOBAL_ERROR:', 'color:#ff6b6b', e.message, e);
    });

    window.addEventListener('unhandledrejection', function (e) {
        const entry = {
            seq:   ++_seq,
            ts:    _ts(),
            label: 'UNHANDLED_PROMISE',
            args:  '—',
            ms:    0,
            ok:    false,
            slow:  false,
            error: e.reason?.message || String(e.reason),
            stack: e.reason?.stack   || null,
        };
        _push(entry);
        if (CFG.LOG_CONSOLE) console.error('%c🔴 UNHANDLED_PROMISE:', 'color:#ff6b6b', e.reason);
    });

    // ── localStorage interceptor ─────────────────────────────
    (function () {
        const _setItem = localStorage.setItem.bind(localStorage);
        const _removeItem = localStorage.removeItem.bind(localStorage);
        localStorage.setItem = function (key, val) {
            if (CFG.ENABLED) {
                const preview = String(val).slice(0, 60);
                _push({ seq: ++_seq, ts: _ts(), label: 'localStorage.setItem',
                    args: `key="${key}", val=${preview}…`, ms: 0, ok: true, slow: false, error: null, stack: null });
            }
            return _setItem(key, val);
        };
        localStorage.removeItem = function (key) {
            if (CFG.ENABLED) {
                _push({ seq: ++_seq, ts: _ts(), label: 'localStorage.removeItem',
                    args: `key="${key}"`, ms: 0, ok: true, slow: false, error: null, stack: null });
            }
            return _removeItem(key);
        };
    })();

    // ── API pública ──────────────────────────────────────────
    window.DDLogger = {

        enable()  { CFG.ENABLED = true;  console.info('%c[DDLogger] Activado',  'color:#55efc4'); },
        disable() { CFG.ENABLED = false; console.info('%c[DDLogger] Desactivado','color:#fdcb6e'); },
        clear()   { _buffer.length = 0; _seq = 0; console.info('%c[DDLogger] Buffer limpiado','color:#81ecec'); },

        getLogs()  { return [..._buffer]; },
        getStats() { return { ..._stats }; },

        exportReport() {
            const now    = new Date();
            const lines  = [];

            lines.push('================================================================');
            lines.push('  DESTINY DRAW — REPORTE DE LOGGING');
            lines.push('================================================================');
            lines.push(`  Generado:      ${now.toLocaleString('es-DO')}`);
            lines.push(`  Sesión inicio: ${_sessionStart.toLocaleString('es-DO')}`);
            lines.push(`  Duración:      ${((now - _sessionStart)/1000).toFixed(0)}s`);
            lines.push(`  Entradas:      ${_buffer.length}`);
            lines.push(`  Errores:       ${_buffer.filter(e => !e.ok).length}`);
            lines.push(`  Llamadas lentas (>=${CFG.SLOW_MS}ms): ${_buffer.filter(e => e.slow).length}`);
            lines.push('');

            // ── RESUMEN DE MÓDULOS ──
            lines.push('────────────────────────────────────────────────────────────────');
            lines.push('  ESTADÍSTICAS POR MÉTODO');
            lines.push('────────────────────────────────────────────────────────────────');
            lines.push(` ${'MÉTODO'.padEnd(45)} ${'CALLS'.padStart(6)} ${'AVG ms'.padStart(8)} ${'ERRORES'.padStart(8)}`);
            lines.push(' ' + '─'.repeat(72));

            const statEntries = Object.entries(_stats)
                .sort((a, b) => b[1].calls - a[1].calls);
            for (const [key, s] of statEntries) {
                const avg = s.calls > 0 ? (s.totalMs / s.calls).toFixed(1) : '0.0';
                const errMark = s.errors > 0 ? ` ← ${s.errors} ERROR(ES)` : '';
                lines.push(` ${key.padEnd(45)} ${String(s.calls).padStart(6)} ${avg.padStart(8)}ms${errMark}`);
            }
            lines.push('');

            // ── ERRORES DESTACADOS ──
            const errors = _buffer.filter(e => !e.ok);
            if (errors.length) {
                lines.push('────────────────────────────────────────────────────────────────');
                lines.push('  ERRORES REGISTRADOS');
                lines.push('────────────────────────────────────────────────────────────────');
                for (const e of errors) {
                    lines.push(`  [#${e.seq}] ${e.ts} | ${e.label}`);
                    lines.push(`  Args:  ${e.args}`);
                    lines.push(`  Error: ${e.error}`);
                    if (e.stack) lines.push(`  Stack: ${e.stack.split('\n').slice(0,3).join(' | ')}`);
                    lines.push('');
                }
            }

            // ── LLAMADAS LENTAS ──
            const slows = _buffer.filter(e => e.slow);
            if (slows.length) {
                lines.push('────────────────────────────────────────────────────────────────');
                lines.push(`  LLAMADAS LENTAS (>= ${CFG.SLOW_MS}ms)`);
                lines.push('────────────────────────────────────────────────────────────────');
                for (const e of slows) {
                    lines.push(`  [#${e.seq}] ${e.ts} | ${e.label} — ${e.ms}ms`);
                    lines.push(`  Args: ${e.args}`);
                    lines.push('');
                }
            }

            // ── LOG COMPLETO ──
            lines.push('────────────────────────────────────────────────────────────────');
            lines.push('  LOG COMPLETO (más reciente al final)');
            lines.push('────────────────────────────────────────────────────────────────');
            for (const e of _buffer) {
                const flag = !e.ok ? '[ERR]' : e.slow ? '[SLOW]' : '[OK] ';
                lines.push(`[#${String(e.seq).padStart(4)}] ${e.ts} ${flag} ${e.label}(${e.args}) → ${e.ms}ms`);
                if (!e.ok && e.error) lines.push(`        ERROR: ${e.error}`);
            }

            lines.push('');
            lines.push('================================================================');
            lines.push('  FIN DEL REPORTE');
            lines.push('================================================================');

            const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `DD_Log_${now.toISOString().slice(0,16).replace(/[T:]/g,'-')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        },
    };

    // ── Inicialización post-carga ────────────────────────────
    // Se espera a window load para que todos los módulos estén definidos
    window.addEventListener('load', function () {
        let wrapped = 0;
        for (const name of TARGETS) {
            const obj = window[name];
            if (obj && typeof obj === 'object') {
                _wrapObject(name, obj);
                wrapped++;
            }
        }
        // switchTab es función global suelta
        if (typeof window.switchTab === 'function') {
            const orig = window.switchTab;
            window.switchTab = function (...args) {
                if (!CFG.ENABLED) return orig.apply(this, args);
                const t0 = performance.now();
                const r  = orig.apply(this, args);
                _record(++_seq - 1, 'switchTab', args.map(_serialize).join(', '), r, _elapsed(t0), null);
                return r;
            };
            wrapped++;
        }
        console.info(
            `%c[DDLogger] ✅ Iniciado — ${wrapped} módulos interceptados. ` +
            `DDLogger.exportReport() para descargar reporte.`,
            'color:#a29bfe;font-weight:bold'
        );
    });

})();
