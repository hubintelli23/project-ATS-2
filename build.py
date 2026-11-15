import base64, pathlib, sys
root = pathlib.Path(__file__).parent
def b64(p, mime):
    return f"data:{mime};base64," + base64.b64encode((root/'assets'/p).read_bytes()).decode()
shell = (root/'src/shell.html').read_text()
js = '\n'.join((root/'src'/f).read_text() for f in ['core.js','story.js','battle.js','main.js'])
out = (shell.replace('%%LOGO%%', b64('logo.webp','image/webp'))
            .replace('%%EDEN%%', b64('eden.jpg','image/jpeg'))
            .replace('%%NESIS%%', b64('nesis.jpg','image/jpeg'))
            .replace('%%JS%%', js))
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(out)
print(len(out))
