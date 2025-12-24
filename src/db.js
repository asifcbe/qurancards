// db.js
import Dexie from 'dexie';

export const db = new Dexie('QuranMemorizerDB');
db.version(2).stores({ // Incremented version
  profiles: '++id, name, currentJuz, currentPage, *memorizedPages', // * denotes multi-entry index
  settings: 'id, reciter, repetitions, theme, scriptType'
});

// Initial settings if not present
db.on('populate', () => {
  db.settings.add({
    id: 'default',
    reciter: 7, // Mishary
    repetitions: 5,
    theme: 'light',
    scriptType: 'quran-uthmani'
  });
});

// Simple backup/restore helpers attached to db instance for convenience
db.export = async () => {
  const data = {};
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }
  return data;
};

db.import = async (data) => {
  await db.transaction('rw', db.tables, async () => {
    for (const tableName of Object.keys(data)) {
      const table = db.table(tableName);
      await table.clear();
      await table.bulkAdd(data[tableName]);
    }
  });
};
