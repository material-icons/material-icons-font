import sys
import json
import fontforge

font_name = '{font_name}'
font_formats = [
    'svg'
]
source_dir = '{source_dir}'
output_dir = '{output_dir}'
output_name = '{output_name}'

glyphs = {/*glyphs*/}

# Create font
font = fontforge.font()
font.em = 512
font.ascent = 512
font.descent = 0
font.familyname = font_name
font.fullname = font_name
font.uwidth = 50
font.upos = -150

# Add all glyphs
for char in glyphs:
    source_file = source_dir + '/' + glyphs[char]
    unicode_id = char
    unicode_hex = hex(unicode_id).upper()[2:]
    unicode_name = 'uni' + unicode_hex
    print("Importing " + glyphs[char] + " > ", file=sys.stderr)
    item = font.createChar(unicode_id, unicode_name)
    item.importOutlines(source_file)
    item.width = 512

# Save files
for font_format in font_formats:
    output_file_name = output_dir + '/' + output_name + '.' + font_format
    print("Generating font file: %s" % output_file_name)
    font.generate(output_file_name)
