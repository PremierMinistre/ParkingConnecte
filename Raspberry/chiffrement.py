import pkcs7
import base64
import hashlib
from Crypto.Cipher import AES

cle = "U93GiADMRixL0agL4iLu2Q==";
cle_bytes = cle.encode('utf-8');

m = hashlib.md5()
m.update(cle_bytes)
cleAUtiliser = m.digest()

def chiffrer(chaineAChiffrer):
    text_bytes = chaineAChiffrer.encode('utf-8')
    cipher = AES.new(cleAUtiliser, AES.MODE_ECB)
    pad_text = pkcs7.encode(text_bytes)
    msg = cipher.encrypt(pad_text)
    EncodeMsg = base64.b64encode(msg)
    encryptedstring = EncodeMsg.decode("utf-8")
    return encryptedstring
def dechiffrer(chaineADechiffrer):
    EncodeMsg = chaineADechiffrer.encode("utf-8")
    msg = base64.b64decode(EncodeMsg)
    cipher = AES.new(cleAUtiliser, AES.MODE_ECB)
    text_bytes = cipher.decrypt(msg)
    text = text_bytes.decode('utf-8')
    text = text.split(text[-1])[0]
    return text
