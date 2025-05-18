


const kon =
[
	0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function	rot(val, r)
{
	var ret = new Uint32Array(1);
	ret[0] = 0;
	ret[0] |= (val >>> r);
	ret[0] |= (val << (32 - r));
	return (ret[0]);
}

function hash_chunk(chunk, hex)
{
	var	wrd = new Uint32Array(64);
	var	idx;
	var	i;

	i = -1;
	while (++i < 16)
	{
		idx = i * 4;
		wrd[i] = 0;
		wrd[i] |= (chunk[idx + 0]) << 24;
		wrd[i] |= (chunk[idx + 1]) << 16;
		wrd[i] |= (chunk[idx + 2]) << 8;
		wrd[i] |= (chunk[idx + 3]) << 0;
	}

	var s0, s1;
	i = 15;
	while (++i < 64)
	{
		s0 = wrd[i - 15];
		s1 = wrd[i - 2];
		s0 = rot(s0, 7) ^ rot(s0, 18) ^ (s0 >>> 3);
		s1 = rot(s1, 17) ^ rot(s1, 19) ^ (s1 >>> 10);
		wrd[i] = wrd[i - 16] + s0 + wrd[i - 7] + s1;
	}

	var a, b, c, d, e, f, g, h;
	a = hex[0];
	b = hex[1];
	c = hex[2];
	d = hex[3];
	e = hex[4];
	f = hex[5];
	g = hex[6];
	h = hex[7];

	var ch, maj;
	var temp1, temp2;
	i = -1;
	while (++i < 64)
	{
		s1 = (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) >>> 0;
		s0 = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) >>> 0;
		ch = ((e & f) ^ ((~e) & g)) >>> 0;
		maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
		temp1 = (h + s1 + ch + kon[i] + wrd[i]) >>> 0;
		temp2 = (s0 + maj) >>> 0;

		h = g;
		g = f;
		f = e;
		e = d + temp1;
		d = c;
		c = b;
		b = a;
		a = temp1 + temp2;
	}

	hex[0] = hex[0] + a;
	hex[1] = hex[1] + b;
	hex[2] = hex[2] + c;
	hex[3] = hex[3] + d;
	hex[4] = hex[4] + e;
	hex[5] = hex[5] + f;
	hex[6] = hex[6] + g;
	hex[7] = hex[7] + h;
}

export function sha256(text)
{
	var hex = new Uint32Array(8);
	hex[0] = 0x6a09e667;
	hex[1] = 0xbb67ae85;
	hex[2] = 0x3c6ef372;
	hex[3] = 0xa54ff53a;
	hex[4] = 0x510e527f;
	hex[5] = 0x9b05688c;
	hex[6] = 0x1f83d9ab;
	hex[7] = 0x5be0cd19;

	var len;
	var chunk = new Uint8Array(64);
	var siz;

	const encoder = new TextEncoder();

	var str;

	var read_idx = 0;
	len = 0;
	siz = (text.length - read_idx);
	while (read_idx + 64 <= text.length)
	{
		len += 64 * 8;
		chunk = text.substr(read_idx, 64);
		chunk = encoder.encode(chunk);
		hash_chunk(chunk, hex);
		read_idx += 64;
		siz = (text.length - read_idx);
	}
	chunk = text.substr(read_idx);
	chunk = encoder.encode(chunk);

	var ch = chunk;
	chunk = new Uint8Array(64);
	for (var i = 0; i < ch.length; i++) { chunk[i] = ch[i]; }

	len += siz * 8;
	len = len & 0xFFFF;
	var pad;
	pad = 512 - (len + 1 + 64);

	var i;
	i = siz;
	chunk[i] = 0x80;
	while (++i < 64)
		chunk[i] = 0;
	chunk[63] = (len >> 0) & 0xFF;
	chunk[62] = (len >> 8) & 0xFF;
	chunk[61] = (len >> 16) & 0xFF;
	chunk[60] = (len >> 24) & 0xFF;

	hash_chunk(chunk, hex);

	text = "";
	for (i = 0; i < 8; i++)
	{
		text += hex[i].toString(16);
	}
	return text;
}
