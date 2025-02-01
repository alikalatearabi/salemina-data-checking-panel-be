const { MongoClient } = require('mongodb');

const uri = 'mongodb://root:hami1370caspersisi@194.147.222.179:27017/?authMechanism=DEFAULT';

const dbName = 'Salemina'; 
const collectionName = 'Salemina_new';

async function fixPictureFields() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find documents where fields need to be swapped
    const filter = {
      $and: [
        // { picture_new: { $regex: '/images/' } },
        // { picture_main_info: { $regex: '/mainpic/' } }
        { picture_extra_info: { $regex: '/images/' } }
      ]
    };

    // Update documents
    const update = {
      $set: {
        // picture_new: { $replaceOne: { input: '$picture_new', find: '/images/', replacement: '/mainpic/' } },
        picture_extra_info: { $replaceOne: { input: '$picture_extra_info', find: '/images/', replacement: '/' } }
      }
    };

    // Apply updates
    const result = await collection.updateMany(filter, [
      {
        $set: {
          // picture_new: {
          //   $cond: [
          //     { $regexMatch: { input: "$picture_new", regex: "/images/" } },
          //     { $replaceOne: { input: "$picture_new", find: "/images/", replacement: "/mainpic/" } },
          //     "$picture_new"
          //   ]
          // },
          picture_main_info: {
            $cond: [
              { $regexMatch: { input: "$picture_extra_info", regex: "/images/" } },
              { $replaceOne: { input: "$picture_extra_info", find: "/images/", replacement: "/" } },
              "$picture_extra_info"
            ]
          }
        }
      }
    ]);

    console.log(`${result.modifiedCount} documents updated`);
  } catch (err) {
    console.error('Error occurred while fixing picture fields:', err);
  } finally {
    // Close the database connection
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the script
fixPictureFields();
