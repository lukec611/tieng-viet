const fs = require('fs').promises;
const path = require('path');

const testDirectory = path.join(__dirname, './exercises');

async function listFilesRecursive(directory) {
    const filePaths = await Promise.all((await fs.readdir(directory)).map(async function(file) {
        const filePath = path.join(directory, file);
        const statsOnFile = await fs.lstat(filePath);
        return {
            path: filePath,
            name: file,
            isDirectory: statsOnFile.isDirectory(),
        };
    }));

    const files = filePaths.filter(file => !file.isDirectory);
    const directories = filePaths.filter(file => file.isDirectory);
    const filesFromSubDirectories = (await Promise.all(directories.map(dir => listFilesRecursive(dir.path))))
        .reduce((cumulativeArr, arr) => [...cumulativeArr, ...arr], []);
    return [...files, ...filesFromSubDirectories];
}

async function getWords(fileData) {
    const data = (await fs.readFile(fileData.path)).toString();
    const words = data.replace(/(\n|\s|:|\.|"|'|[\d]|\(|\)|-|>|<|,|;)/g, ' ').split(' ').map(x => x.trim().toLowerCase()).filter(x => x);
    return words;
}

async function processFiles(list) {
    const words = (await Promise.all(list.map(getWords)))
        .reduce((arr, list) => [...arr, ...list], []);
    const vocab = new Set(words).size;
    console.log(`
    Vocabulary: ~${Number(vocab)/2.5}
    Words written: ~${Number(words.length)}
    No. A4 Pages: ~${words.join('').length / 624}
    No. 128 Page A4 books: ~${words.join('').length / (624 * 128)}
    `);
}

listFilesRecursive(testDirectory)
    .then(x => processFiles(x))
    .catch(error => console.log(error));




// fs.lstat(__dirname, function (err, stat) {
//     if (err) {

//     } else {
//         console.log(stat.isFile());
//         console.log(stat.isDirectory());
//     }
// });