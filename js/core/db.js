/* Banco de dados local: IndexedDB do navegador (sem servidor, sem instalação). */
(function (P) {
  var STORES = ['patients', 'exams', 'customTasks', 'users'];
  var DATA = ['patients', 'exams', 'customTasks'];   // entram no backup (contas ficam de fora)

  var ready = new Promise(function (resolve, reject) {
    var req = indexedDB.open('psilog', 2);
    req.onupgradeneeded = function () {
      STORES.forEach(function (s) {
        if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s, { keyPath: 'id' });
      });
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });

  function run(store, mode, fn) {
    return ready.then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx;
        var req;
        var settled = false;
        function fail(error) {
          if (settled) return;
          settled = true;
          reject(error || new Error('Falha ao acessar o banco de dados local.'));
        }
        try {
          tx = db.transaction(store, mode);
          req = fn(tx.objectStore(store));
          tx.oncomplete = function () {
            if (settled) return;
            settled = true;
            resolve(req ? req.result : undefined);
          };
          tx.onerror = function () { fail(tx.error); };
          tx.onabort = function () { fail(tx.error || new Error('A operação no banco de dados foi cancelada.')); };
          if (req) req.onerror = function () { fail(req.error); };
        } catch (error) {
          fail(error);
        }
      });
    });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  var DB = {
    uid: uid,
    all: function (store) { return run(store, 'readonly', function (o) { return o.getAll(); }); },
    get: function (store, id) { return run(store, 'readonly', function (o) { return o.get(id); }); },
    put: function (store, item) {
      item.id = item.id || uid();
      item.createdAt = item.createdAt || new Date().toISOString();
      return run(store, 'readwrite', function (o) { return o.put(item); }).then(function () { return item; });
    },
    del: function (store, id) { return run(store, 'readwrite', function (o) { return o.delete(id); }); },
    /** Apaga pacientes e exames (e as contas de paciente). Contas de profissional e atividades ficam. */
    clear: async function () {
      await Promise.all(['patients', 'exams'].map(function (s) { return run(s, 'readwrite', function (o) { return o.clear(); }); }));
      for (var u of await DB.all('users')) if (u.role === 'paciente') await DB.del('users', u.id);
    },
    /** Exporta tudo (backup). */
    dump: async function () {
      return { app: 'psilog', v: 2, patients: await DB.all('patients'), exams: await DB.all('exams'), customTasks: await DB.all('customTasks') };
    },
    /** Importa um backup gerado por dump(). */
    load: async function (json) {
      for (var s of DATA) for (var item of json[s] || []) await DB.put(s, item);
    }
  };

  P.DB = DB;
})(window.Psilog);
