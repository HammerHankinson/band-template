const airtableBase = (config) => {
  // destructing
  const {apiKey, baseId} = config;
  const Airtable = require('airtable');
  const base = new Airtable({apiKey: apiKey}).base(baseId);
  const selectionOpts = {
    maxRecords: 99,
    view: "Grid view"
  };

  return {
    list: () => {
      return new Promise((resolve, reject) => {
        // global array of records to resolve this promise with
        const records = [];
        // call out to airtable API...

        // first, grab table name we want to connect to
        base(config.tableName)
        // then, specify how many records to grab
            .select(selectionOpts)
            // for each "page" that is retrieved, do the following...
            .eachPage(function page(airtableRecords, fetchNextPage) {
              // This function (`page`) will get called for each page of records.
              //console.log(records)
              airtableRecords.forEach(function(record) {
                const backend_id = record['_rawJson']['id'];
                const updatedRecord = Object.assign({}, record['_rawJson']['fields'], {
                  'backend_id': backend_id,
                })
                records.push(updatedRecord)
              });

              // To fetch the newxt page of records, call `fetchNextPage`.
              // If there are more records, `page` will get called again.
              // If there are no more records, `done` will get called.
              fetchNextPage();

            }, function done(err) {
              if (err) { reject(err); return; }
              // console.log('records=', records)
              resolve(records)
            });
      });
    },
    create: () => {

    }
  }
};

const getSongList = (config) => {
  const _list = {};
  const _uuid4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  // @TODO: validate!
  const _validateItem = item => {return true;}
  // @TODO: validate!
  const _validatePrice = price => {return Math.random() < 0.5 ? true : true;}

  const _itemExists = id => {
    if (typeof id !== "string") {
      return false;
    }

    if (typeof _list[id] === "undefined") {
      return false;
    }

    return true;
  };

  const a = airtableBase({
    apiKey: 'keyBmOGOvQq5eykdy',
    baseId: 'appE66EhRzQvRZ30R',
    tableName: 'Songs'
  });

  return {
    create: (song, artist) => {
      return new Promise((resolve, reject) => {
        const id = _uuid4();
        if (!_validatePrice(price) || !_validateItem(item)) {
          reject("Price or Item is not valid!");
          return;
        }

        _list[id] = {
          'song': song,
          'artist': artist,
        }
        resolve(id)
      })
    },
    list: () => {
      return a.list();

      // if (config.type === "airtable") {
      // 	return a.list();
      // }
      // else {
      // 	// ... do something to return the in-memory version
      // }

    },
  };
};


const sl = getSongList();

console.log(sl.list());