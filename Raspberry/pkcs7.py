import binascii
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO


def decode(bytestring, k=16):
    val = binascii.hexlify(bytestring[-1])
    val = int(val, 16)
    if val > k:
        raise ValueError('Input is not padded or padding is corrupt')
    l = len(bytestring) - val
    return bytestring[:l]


def encode(bytestring, k=16):
    l = len(bytestring)
    output = StringIO()
    val = k - (l % k)
    for _ in range(val):
        output.write('%02x' % val)
    return bytestring + binascii.unhexlify(output.getvalue())
