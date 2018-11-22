async function _(text) {
	return gettext(text);
}

async function gettext(text) {
	var buffer  = await getBuffer();
	var view    = new DataView(buffer);
	var bytes   = new Uint8Array(buffer);
	var decoder = new TextDecoder('utf-8');

	var endian        = view.getUint32(0) === 0xde120495 ? 1 : 0;
	var revision      = view.getUint32(4, endian);
	var string_length = view.getUint32(8, endian);
	var orgin_offset  = view.getUint32(12, endian);
	var trans_offset  = view.getUint32(16, endian);
	var hash_size     = view.getUint32(20, endian);
	var hash_offset   = view.getUint32(24, endian);

	return binsearch(text);

	function getBuffer() {
		let promise = new Promise((resolve, reject) => {
			let request = new XMLHttpRequest();
			let url     = 'messages.mo';

			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			request.onload  = (event) => resolve(request.response);
			request.onerror = (event) => reject(request.error);

			request.send();
		});

		return promise;
	}

	function binsearch(text, start = 1, end = string_length) {
		function getString(current, lang_offset) {
			let meta_offset = lang_offset + ((current - 1) * 8);
			let length      = view.getUint32(meta_offset, endian);
			let offset      = view.getUint32(meta_offset + 4, endian);
			let str_binary  = bytes.subarray(offset, offset + length);
				
		    return decoder.decode(str_binary);
		}

		while(start <= end) {
			let current = (start + end) >> 1;
			let string  = getString(current, orgin_offset);

			if(text === string) {
				return getString(current, trans_offset);
			}

			else if(text > string) {
				start = ++current;
			}

			else {
				end = --current;
			}
		}

		return text;
	}
}
