---
title: "Simulating cell division in Blender"
slug: "simulating-cell-division-blender"
published: 2020-06-30
blurb: "Using python and some blender physics to simulate a simple model of cell division"
tag:
  - "Python"
  - "Blender"
active: "Blog"
---
Using Blender's rigid body physics, and a smidge of poorly written python, we can create a very basic simulation of cell divison:

<video loop autoplay muted playsinline class="w-100 ba b--black-80 br2" name="media">
  <source src="cells.mp4" type="video/mp4"> 
</video>

Each cell consists of a rigid body, which interacts with other rigid bodies in the simulation, and a metaball parented to the rigid body, which is what actually gets rendered on screen. When a cell duplicates, the rigid bodies of each cell push each other apart:

<video loop autoplay muted playsinline class="w-100 ba b--black-80 br2" name="media">
  <source src="rigid_body_division.mp4" type="video/mp4"> 
</video>

To begin, we'll set up a Cell class:

```python
class Cell:
    def __init__(self, rigid_body, metaball):
        # initiate cell with a random division time
        self.divisionTime = random.randint(60, 120)
        # each cell is composed of two objects, a rigid body that is part of the simulation
        # and a metaball that is rendered
        self.rigid_body = rigid_body
        self.metaball = metaball
```

The basic idea is simple: each cell has an internal counter which gets decremented each frame, and if the counter equals zero, the cell divides (creates a duplicate of itself):

```python
def decrementTime(self):
    if (self.divisionTime == 0):
        self.divisionTime = random.randint(60, 120)
        self.duplicate()
    else:
        self.divisionTime -= 1;
```

When a cell duplicates, we copy the rigid body and metaball from a prototypical cell object (which we just hide in another layer in Blender, not part of the simulation.) These objects are placed at the location of the cell which just duplicated:

```python
def duplicate(self):
    # get current cell position
    matrix = self.rigid_body.matrix_world.copy()
    print(self.rigid_body)
    print(matrix.translation)
    position = matrix.translation

    # copy rigid body
    rb = deep_copy(rb_orig)
    rb.matrix_world = matrix

    # ensure that the new rigid body object is in the rigid body collection
    ensure_single_collection(rb, rigid_bodies)

    # set rigid body position by translating the vertices in edit mode
    rb.select_set(True)
    bpy.context.view_layer.objects.active = rb
    bpy.ops.object.editmode_toggle()
    bpy.ops.transform.translate(value = position)
    bpy.ops.object.editmode_toggle()
    rb.select_set(False)
    bpy.context.view_layer.objects.active = None

    #copy metaball
    mb = deep_copy(mb_orig)

    # ensure that the new metaball is in the metaball collection
    ensure_single_collection(mb, metaballs)

    # position and parent the metaball to the rigid body
    mb.location = position
    mb.parent = rb
    mb.matrix_parent_inverse = rb.matrix_world.inverted()

    # create new cell object
    new_cell = Cell(rb, mb)

    # add to array of cells in simulation
    cells.append(new_cell)
```

Some helper functions used in the function above for collection management and copying objects:

```python
def ensure_single_collection(object, collection):
    if object.name not in collection.objects:
        collection.objects.link(object)
        for c in bpy.data.collections:
            if c is not collection and object.name in c.objects:
                c.unlink(object)
    if object.name in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.unlink(object)

def deep_copy(obj):
    new_obj = obj.copy()
    new_obj.data = obj.data.copy()
    return new_obj
```

Since the Eevee render engine doesn't play well with frame handlers (at least on my machine), the render is handled by a simple loop:

```python
for frame in range(scene.frame_start, scene.frame_end + 1):
    add_cells(scene)
    bpy.context.scene.render.filepath = filepath + str(frame).zfill(4)
    scene.frame_set(frame)
    bpy.ops.render.render(write_still=True)
    if frame == scene.frame_end:
        bpy.context.scene.render.filepath = filepath #reset filepath
```
  
The function **add_cells()** decrements counter for each cell in our cell array, and handles clearing objects when we reach the end of the range of rendered frames:

```python
def add_cells(scene):
    if scene.frame_current == scene.frame_end:
        bpy.ops.screen.animation_cancel()
        remove_all_objects_from_collection(rigid_bodies)
        remove_all_objects_from_collection(metaballs)
        remove_unused_data_blocks()
    else:
        for cell in cells:
            cell.decrementTime()
        
def remove_unused_data_blocks():
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)

def remove_all_objects_from_collection(collection):
    objects_to_delete = collection.objects
    for o in objects_to_delete:
        bpy.data.objects.remove(o, do_unlink=True)
```

(This approach could definitely be improved – for example, the end condition should probably be handled inside the render loop itself.)

The full script is as follows:

```python
import bpy, math, random

scene = bpy.context.scene
bpy.context.scene.frame_set(1)

rigid_bodies = bpy.data.collections['Rigid Bodies']
metaballs = bpy.data.collections['Metaballs']

class Cell:
    def __init__(self, rigid_body, metaball):
        # initiate cell with a random division time
        self.divisionTime = random.randint(60, 120)
        # each cell is composed of two objects, a rigid body that is part of the simulation
        # and a metaball that is rendered
        self.rigid_body = rigid_body
        self.metaball = metaball
    def decrementTime(self):
        if (self.divisionTime == 0):
            self.divisionTime = random.randint(60, 120)
            self.duplicate()
        else:
            self.divisionTime -= 1;
            
    def duplicate(self):
        # get current cell position
        matrix = self.rigid_body.matrix_world.copy()
        print(self.rigid_body)
        print(matrix.translation)
        position = matrix.translation
        
        # copy rigid body
        rb = deep_copy(rb_orig)
        rb.matrix_world = matrix
        
        # ensure that the new rigid body object is in the rigid body collection
        ensure_single_collection(rb, rigid_bodies)
        
        # set rigid body position by translating the vertices in edit mode
        rb.select_set(True)
        bpy.context.view_layer.objects.active = rb
        bpy.ops.object.editmode_toggle()
        bpy.ops.transform.translate(value = position)
        bpy.ops.object.editmode_toggle()
        rb.select_set(False)
        bpy.context.view_layer.objects.active = None
        
        #copy metaball
        mb = deep_copy(mb_orig)
        
        # ensure that the new metaball is in the metaball collection
        ensure_single_collection(mb, metaballs)

        # position and parent the metaball to the rigid body
        mb.location = position
        mb.parent = rb
        mb.matrix_parent_inverse = rb.matrix_world.inverted()
        
        # create new cell object
        new_cell = Cell(rb, mb)
        
        # add to array of cells in simulation
        cells.append(new_cell)

def ensure_single_collection(object, collection):
    if object.name not in collection.objects:
        collection.objects.link(object)
        for c in bpy.data.collections:
            if c is not collection and object.name in c.objects:
                c.unlink(object)
    if object.name in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.unlink(object)

def deep_copy(obj):
    new_obj = obj.copy()
    new_obj.data = obj.data.copy()
    return new_obj

def add_cells(scene):
    if scene.frame_current == scene.frame_end:
        bpy.ops.screen.animation_cancel()
        remove_all_objects_from_collection(rigid_bodies)
        remove_all_objects_from_collection(metaballs)
        remove_unused_data_blocks()
    else:
        for cell in cells:
            cell.decrementTime()

def remove_unused_data_blocks():
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)

def remove_all_objects_from_collection(collection):
    objects_to_delete = collection.objects
    for o in objects_to_delete:
        bpy.data.objects.remove(o, do_unlink=True)

remove_all_objects_from_collection(rigid_bodies)
remove_all_objects_from_collection(metaballs)
remove_unused_data_blocks()

cells = []
rb_orig = bpy.data.objects["Rigid Body"]
mb_orig = bpy.data.objects["Mball"]
first_cell = Cell(rb_orig, mb_orig)
first_cell.duplicate()
cells[0].divisionTime = 1

filepath = bpy.context.scene.render.filepath = "/Users/sean/Desktop/cell_division/test-frames/"

for frame in range(scene.frame_start, scene.frame_end + 1):
    add_cells(scene)
    bpy.context.scene.render.filepath = filepath + str(frame).zfill(4)
    scene.frame_set(frame)
    bpy.ops.render.render(write_still=True)
    if frame == scene.frame_end:
        bpy.context.scene.render.filepath = filepath #reset filepath
```

A couple things to note:
- In order to get accurate positions for the rigid bodies, the **Steps per Second** and **Solver Iterations** both need to be turned way up from the defaults (I arbitrarily set 200 for each).
- In order to keep the cells clustered together, there is an attractive force field pulling the rigid bodies towards the center.

Download the [blender file](https://drive.google.com/file/d/1xde9YH09Lb4piirjevfquL-dMWWDVzt3/view?usp=sharing) if you'd like to take a look around or use it in one of your projects.