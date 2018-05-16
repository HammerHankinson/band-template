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
                });
                records.push(updatedRecord)
              });

              // To fetch the newxt page of records, call `fetchNextPage`.
              // If there are more records, `page` will get called again.
              // If there are no more records, `done` will get called.
              fetchNextPage();

            }, function done(err) {
              if (err) { reject(err); return; }
              //console.log('records=', records)
              resolve(records)
            });
      });
    },
    create: () => {

    }
  }
};

const getSongList = (config) => {

  const a = airtableBase({
    apiKey: 'keyBmOGOvQq5eykdy',
    baseId: 'appE66EhRzQvRZ30R',
    tableName: 'Songs'
  });

  const b = airtableBase({
    apiKey: 'keyBmOGOvQq5eykdy',
    baseId: 'appTU8qIB4tqUk280',
    tableName: 'Show List'
  });

  return {
    songs: () => {
      return a.list();
    },
    shows: () => {
      return b.list()
    }
  };
};

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


const sl = getSongList();
const songs = sl.songs();
const shows = sl.shows();

Promise.all([shows])
    .then(showList => {
      const showKey = showList[0];
      const showTable = document.querySelector('.showTableBody');
      let showRender = '';
      for (let i = 0; i < showKey.length; i++) {
        showRender += `<tr>
                    <td scope="row">${showKey[i].Date}</td>
                    <td>${showKey[i].Venue}</td>
                    <td>${showKey[i].VenueAddress}</td>
                    <td>${showKey[i].Time}</td>
                </tr>`;
        showTable.innerHTML = showRender;
      }
    })
    .catch(err => {
      console.log('REASON: ', err)
    });

Promise.all([songs])
    .then(songList => {
      const shuffleList = () => {
        const shuffledList = shuffle(songList[0]);
        const result = shuffledList.slice(0, 8);
        const songTable = document.querySelector('.songTableBody');
        let resultList = '';
        for(let i = 0; i < result.length; i++) {

          resultList += `<tr>
                            <td scope="row">${result[i].Song}</td>
                            <td>${result[i].Artist}</td>
                        </tr>`;
          songTable.innerHTML = resultList;
        }
      };
      shuffleList();
      const randomBtn = document.querySelector('.randomize');
      randomBtn.addEventListener('click', event => {
        shuffleList();
      })
    })
    .catch(err => {
      console.log('REASON: ', err)
    });