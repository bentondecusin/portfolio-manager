// const { default: next } = require('next');
const txnSVC = require('../service/transactionService')

async function getAllTxn(req, res) {
  try {
    res.json(await txnSVC.getTxns());
  } catch (e) {
    console.log('Error in controller: getAllTxn', e);
  }
}

async function getTxnById(req, res) {
  try {
    res.json(await txnSVC.getTxnById(req.params.id));
  } catch (e) {
    console.log('Error in controller: getTxnById', e);
  }
}

async function getTxnBySymbol(req, res) {
  try {
    res.json(await txnSVC.getTxnBySymbol(req.params.symbol));
  } catch (e) {
    console.log('Error in controller: getTxnBySymbol', e);
  }
}

async function getTxnByDate(req, res) {
  try {
    // Convert the date string from req.params.date to MySQL DATETIME format (ISO 8601: "YYYY-MM-DDTHH:mm:ss.sssZ")
    const parsedDate = new Date(req.params.date);
    if (!isNaN(parsedDate.getTime())) {
      req.params.date = parsedDate.toISOString();
    } else {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    res.json(await txnSVC.getTxnByDate(req.params.date));
  } catch (e) {
    console.log('Error in controller: getTxnByDate', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function postSingleTxn(req, res) {
  try {
    // Convert ISO date string to MySQL DATETIME format
    if (req.body.txnTs) {
      const parsedDate = new Date(req.body.txnTs);
      if (!isNaN(parsedDate.getTime())) {
        // Convert to MySQL DATETIME format: YYYY-MM-DD HH:mm:ss
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const hours = String(parsedDate.getHours()).padStart(2, '0');
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
        const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
        
        req.body.txnTs = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } else {
        return res.status(400).json({ error: 'Invalid date format in txnTs' });
      }
    }
    
    res.json(await txnSVC.insertSingleTxn(req.body));
  } catch (e) {
    console.log('Error in controller: postSingleTxn', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function putSingleTxn(req, res) {
  try {
    // Validate that req.body exists and has content
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required for upsert' });
    }

    // Convert ISO date string to MySQL DATETIME format (same as POST)
    if (req.body.txnTs) {
      const parsedDate = new Date(req.body.txnTs);
      if (!isNaN(parsedDate.getTime())) {
        // Convert to MySQL DATETIME format: YYYY-MM-DD HH:mm:ss
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const hours = String(parsedDate.getHours()).padStart(2, '0');
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
        const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
        
        req.body.txnTs = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } else {
        return res.status(400).json({ error: 'Invalid date format in txnTs' });
      }
    }
    
    // Use upsert logic: INSERT if not exists, UPDATE if exists
    res.json(await txnSVC.upsertSingleTxn(req.params.id, req.body));
  } catch (e) {
    console.log('Error in controller: putSingleTxn', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function delSingleTxn(req, res) {
  try {
    res.json(await txnSVC.deleteSingleTxn(req.params.id));
  } catch (e) {
    console.log('Error in controller: deleteSingleTxn', e);
  }
}

module.exports = { 
  getAllTxn, 
  getTxnById, 
  getTxnBySymbol, 
  getTxnByDate, 
  postSingleTxn, 
  putSingleTxn, 
  delSingleTxn 
};
