import os
import glob
from shutil import copy

source_dir = "/Users/sean/Projects/inform/public/work/"
dest_dir = "/Users/sean/Projects/inform/src/work/"
image_template = "/Users/sean/Projects/inform/templates/image.md"
video_template = "/Users/sean/Projects/inform/templates/video.md"

def list_dirs(path):
    return [os.path.basename(x) for x in filter(
        os.path.isdir, glob.glob(os.path.join(path, '*')))]

#for f in list_dirs(source_dir):
#    video_path = source_dir + f + "/thumb.mp4"
#    check_file = dest_dir + f + ".md.hbs"
#    new_file = dest_dir + f + ".md.hbs"
#    if os.path.isfile(check_file):
#        pass
#    else:
#        if os.path.isfile(video_path):
#            copy(video_template, new_file)
#        else:
#            copy(image_template, new_file)

for f in list_dirs(source_dir):
    index_file = dest_dir + f + "/index.html"
    try:
        os.remove(index_file)
    except:
        pass
