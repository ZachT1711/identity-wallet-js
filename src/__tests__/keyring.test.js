const Keyring = require('../keyring')
const HDNode = require('@ethersproject/hdnode')


describe('Keyring', () => {

  let keyring1
  let keyring2
  let keyring3
  const seed = HDNode.mnemonicToSeed('clay rubber drama brush salute cream nerve wear stuff sentence trade conduct')

  it('throws error if no seed', async () => {
    expect(() => new Keyring()).toThrow()
  })

  it('derives correct keys from entropy', async () => {
    keyring2 = new Keyring('0xf0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b')
    keyring3 = new Keyring('0x24a0bc3a2a1d1404c0ab24bef9bb0618938ee892fbf62f63f82f015eddf1729e')
    expect(keyring2._seed).toEqual('0xf0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b')
  })

  it('derives correct keys from seed', async () => {
    keyring1 = new Keyring(seed)

    expect(keyring1.getPublicKeys()).toMatchSnapshot()
    expect(keyring1.getPublicKeys({ mgmtPub: true })).toMatchSnapshot()
    expect(keyring1.getPublicKeys({ uncompressed: true })).toMatchSnapshot()
    expect(keyring1.serialize()).toEqual(seed)
  })

  it('signs data correctly', async () => {
    expect((await keyring1.getJWTSigner()('asdf'))).toMatchSnapshot()
    expect((await keyring1.getJWTSigner('space1')('asdf'))).toMatchSnapshot()
    expect((await keyring1.getJWTSigner('space2')('asdf'))).toMatchSnapshot()
  })

  it('encrypts and decrypts correctly', () => {
    const testMsg = "Very secret test message"
    let box = keyring1.asymEncrypt(testMsg, keyring2.getPublicKeys().asymEncryptionKey)

    let cleartext = keyring2.asymDecrypt(box.ciphertext, box.ephemeralFrom, box.nonce)
    expect(cleartext).toEqual(testMsg)
  })

  it('symmetrically encrypts correctly', async () => {
    const testMsg = "Very secret test message"
    const box = keyring2.symEncrypt(testMsg)
    const cleartext = keyring2.symDecrypt(box.ciphertext, box.nonce)
    expect(cleartext).toEqual(testMsg)
  })

  it('encrypts and decrypts correctly with authSecret', () => {
    const testMsg = "Very secret test message"
    const authSecret = Buffer.from(Keyring.naclRandom(32)).toString('hex')

    const box = Keyring.encryptWithAuthSecret(testMsg, authSecret)
    const cleartext = Keyring.decryptWithAuthSecret(box.ciphertext, box.nonce, authSecret)
    expect(cleartext).toEqual(testMsg)
  })
})
