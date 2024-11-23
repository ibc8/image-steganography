const sharp = require('sharp');
let inputText = ("Привет, Алиса!") //ввод текста
inputText += "   ";
const utf8Encoded = Buffer.from(inputText, 'utf8');
//! console.log(utf8Encoded);

//& Преобразуем в бинарный вид
const utf8Array = [];
for (let i = 0; i < utf8Encoded.length; i++) {
    const byte = utf8Encoded[i].toString(2).padStart(8, '0');
    utf8Array.push(...byte.split('').map(Number));
}

//& console.log("\nДлина:", utf8Array.length);
const textLength = utf8Array.length;

//& Преобразуем число в бинарную строку
const binaryString = textLength.toString(2);

//& Дополняем нулями слева до 32 бит (4 байта)
const paddedBinaryString = binaryString.padStart(21, '0');

//& Преобразуем строку в массив из 0 и 1
const arrayFromLength = paddedBinaryString.split('').map(Number);

function red(red, array) {
    red = red - (red % 2);
    red = red + array;
    return red;
}

sharp('input.png') //! изменить на jpg
    .ensureAlpha() //& Чек альфа канал, для jpg убрать
    .raw() //& Получите необработанные данные
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
        const { width, height } = info;
        //! console.log(inputText.length)
        let count = 0;
        let count2 = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (width * y + x) * 4; //& Индекс для RGBA
                if (count <= 20) { //! контрольная сумма
                    data[index] = red(data[index], arrayFromLength[count]);
                    count += 1;
                    //! console.log(arrayFromLength[count]);
                    continue;
                }
                if (count == 21) { //! контрольная сумма
                    data[index] = data[index];
                    count += 1;
                    //! console.log(arrayFromLength[count]);
                    continue;
                }
                if ((count <= (textLength + 1))) {
                    data[index] = red(data[index], utf8Array[count2]);
                    count2 += 1;
                    count += 1;
                }
            }
        }

        const bytes = [];
        for (let i = 0; i < utf8Array.length; i += 8) {
            const byte = utf8Array.slice(i, i + 8).join('');
            bytes.push(parseInt(byte, 2));
        }

        //! Создаем буфер из байтов и декодируем в строку
        const decodedText = Buffer.from(bytes).toString('utf8');

        console.log("Текст:", decodedText);
        return sharp(data, { raw: { width, height, channels: 4 } })
            //! .jpeg({ quality: 90 }) // необходим для jpg
            .toFile('output.png'); //! изменить на jpg
    })
    .then(() => {
        console.log('Изображение успешно обработано и сохранено!');
    })
    .catch(err => {
        console.error('Ошибка при обработке изображения:', err);
    });