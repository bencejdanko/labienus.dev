#https://www.davidpriver.com/c-in-wasm.html
#https://rob-blackbourn.github.io/blog/webassembly/wasm/strings/javascript/c/libc/wasm-libc/clang/2020/06/20/wasm-string-passing.html
cli: cli.c
	clang --target=wasm32 --no-standard-libraries --ffreestanding -nostdinc -mbulk-memory -mreference-types -mmultivalue -mmutable-globals -mnontrapping-fptoin -msign-ext -Wl,--export-all,--no-entry,--allow-undefined
