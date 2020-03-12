const express = require('express');
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const multer = require('multer')
const app = express();
const port = 5000;
const upload = multer({ storage: multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.resolve(process.cwd(), 'uploads'));
    },

    filename: function(req, file, callback) {
        var fname = file.fieldname + '-' + Date.now() + path.extname(file.originalname);

        callback(null, fname);

    }
}) })

if(!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Google credentials not found')
}

const getData = async (imageResult) => {
    let splitted = imageResult.description.split('\n');
    let CNPJ = '';
    let COO = '';
    let DAT = '';

    splitted.forEach(text => {
        let line = '';
        let readingCNPJ = false;
        let readingCOO = false;
        let readingDAT = false;
        for(char in text) {
            line += text[char].trim();   

            if(line.substr(line.length - 5, 5).replace('H', 'N') == 'CNPJ:') {
               readingCNPJ = true;
            }

            if(line.substr(line.length - 4, 4).replace(/0/g, 'O') == 'COO:') {
                readingCOO = true;
            }

            if(line.substr(line.length - 4, 4) == 'CCF:') {
                readingDAT = true;
            }

            if ((readingCNPJ) && ([':', ' ', '.', ',', '/', '-'].indexOf(text[char]) == -1)){
                CNPJ += text[char];
                if (CNPJ.length == 14) {
                    readingCNPJ = false;
                }
            }

            if ((readingCOO) && ([':', ' ', '.', ',', '/', '-'].indexOf(text[char]) == -1)) {
                COO += text[char];
                if(COO.length == 9) {
                    readingCOO = false;
                }
            }

            if (readingDAT) {
                DAT = line.substr(0, 18);  
                readingDAT = false;
            }
        }
    });

    let retObj = {
        CNPJ: CNPJ,
        COO: COO,
        DAT: DAT
    }

    return retObj;
}

const formatCNPJ = CNPJ => {
    if(isNaN(CNPJ)){
        return 'The CNPJ could not be read';
    } else {
        return CNPJ.replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, "$1.$2.$3/$4-$5");
    }
}

const formatCOO = COO => {
    if(isNaN(COO)){
        return 'The COO could not be read';
    } else {
        return COO;
    }
}

const formatDAT = DAT => {
    let day, month, year, hour, minute, second, inconsistentTime, inconsistentDate, dateInconsistency = '', timeInconsistency = '';
    day = DAT.substr(0, 2);
    month = DAT.substr(3, 2);
    year = DAT.substr(6, 4);

    if(isNaN(day) || isNaN(month) || isNaN(year)) {
        inconsistentDate = true;
        dateInconsistency = 'The date could not be read';
    }

    DAT = DAT.substr(10, DAT.length).trim();

    hour = DAT.substr(0, 2);
    minute = DAT.substr(3, 2);
    second = DAT.substr(6, 2);

    if(isNaN(minute)){
        minute = '00';
        timeInconsistency = 'The time is rounded and may appear inaccurate';
    }

    if(isNaN(second)){
        second = '00';
        timeInconsistency = 'The time is rounded and may appear inaccurate';
    }

    if(isNaN(hour)){
        inconsistentTime = true;
        timeInconsistency = 'The time could not be read';
    }

    let date = '', time = '';

    if (!inconsistentDate) {
        date = `${day}/${month}/${year}`;
    }
    if (!inconsistentTime) {
        time = `${hour}:${minute}:${second}`;
    }

    let ret = {
        date: date,
        time: time,
        dateInconsistency: dateInconsistency,
        timeInconsistency: timeInconsistency,
    }

    return ret;

}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/uploadAndRead', upload.single('image'), async (req, res) => {
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    const fileName = path.resolve(process.cwd(), 'uploads', req.file.filename);
    
    // Performs text detection on the local file
    const [result] = await client.textDetection(fileName);
    const [detection] = result.textAnnotations;
    
    let data = await getData(detection);


    let formattedDAT = formatDAT(data.DAT);
    res.send({ 
        CNPJ:formatCNPJ(data.CNPJ), 
        COO:formatCOO(data.COO), 
        DAT:`${formattedDAT.date} ${formattedDAT.time}`, 
        DateInconsistency:formattedDAT.dateInconsistency, 
        TimeInconsistency:`${formattedDAT.timeInconsistency}`,
        imagePath: req.file.filename
       });
})

app.listen(port, () => {
    console.log(`The server is running at localhost:${port}`);
});
