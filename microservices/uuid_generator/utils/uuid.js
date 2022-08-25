const CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789"
const UUID_LENGTH = 8

const generateUuid = () => {
  let result = ''
  for (let i = 0; i < UUID_LENGTH; i++) {
    const index = Math.floor(Math.random() * CHARACTERS.length)
    result += CHARACTERS[index]
  }
  return result
}

module.exports = generateUuid