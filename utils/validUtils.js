const isValidString = (value) => {
    return typeof value === 'string' && value.trim() !== '';
}

// 可增加其他檢查: 例如正整數
const isNumber = (value) => {
    return typeof value === 'number' && !isNaN(value);
}

const isValidPassword = (value) => {
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
    return passwordPattern.test(value);
}

const isValidImageUrl = (url) => {
    return typeof url === 'string' && /\.(png|jpg)$/i.test(url);
}

const isValidUUID = (value) => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && uuidPattern.test(value);
}

module.exports = {
    isValidString,
    isNumber,
    isValidPassword,
    isValidImageUrl,
    isValidUUID
}
