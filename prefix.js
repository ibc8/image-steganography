const sharp = require('sharp');


sharp('output.png') //! изменить на jpg
    // .ensureAlpha() //& Чек альфа канал, для jpg убрать
    .raw() //& Необработанные данные
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
        const { width, height } = info;
        let count = 0;
        let textArray = [];
        let controlSum = [];
        let sumFlag = false;
        let combinedValue = '';
        let binaryString = 0;
        let decimalNumber = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (width * y + x) * 4; //& RGBA
                if (count <= 21) {
                    controlSum[count] = data[index] % 2


                    binaryString = controlSum.join('');

                    //& Шаг 2: Преобразование бинарной строки в десятичное число
                    decimalNumber = parseInt(binaryString, 2);
                    decimalNumber = decimalNumber / 2;
                    //! console.log(decimalNumber);

                    count += 1
                    //! console.log(count, "***", data[index].toString(), "***");
                    continue;
                }

                if ((count <= decimalNumber)) { // 
                    //& Получаем значения из RGB каналов
                    let value1 = data[index].toString() % 2;
                    textArray.push(value1);
                    count += 1;
                    //! console.log("gj", data[index].toString() % 2, count);
                }
            }
        }

        const binaryString2 = textArray.join('');

        //& Разбиваем на 8-битные группы
        const bytes = [];
        for (let i = 0; i < binaryString2.length; i += 8) {
            const byte = binaryString2.slice(i, i + 8);
            if (byte.length === 8) {
                bytes.push(parseInt(byte, 2));
            }
        }

        //& Преобразуем байты в текст
        const decodedText = Buffer.from(bytes).toString('utf8');

        console.log("Текст: ", decodedText);
    })


    .then(() => {
        console.log('Успешно');
    })
    .catch(err => {
        console.error('Ошибка при обработке изображения:', err);
    });