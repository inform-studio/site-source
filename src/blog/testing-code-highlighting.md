---
title: "Testing code highlighting"
slug: "testing-code-highlighting"
published: 2020-06-18
blurb: "Just testing out a metalsmith plugin so syntax highlighting works in the blog."
tag:
  - "Site Development"
active: "Blog"
---

Using [metalsmith-code-highlight](https://github.com/fortes/metalsmith-code-highlight), let's see what happens. Here's an example of python:

```python
def regular_polygon(initial_point, radius, num_points, centered=True, highlight_points = True):
    if (num_points < 3):
        num_points = 3  

    points = []

    angle = 2 * math.pi / num_points

    p = initial_point

    if (centered):
        center_angle =  (3 * math.pi / 2) + angle / 2
        p = project_from_angle(initial_point, center_angle, radius)

    length_of_side = 2 * radius * math.sin(math.pi/num_points)

    for point in range(num_points):
        points.append(p)
        p = project_from_angle(p, angle, length_of_side)
        angle += 2 * math.pi / num_points

    if (highlight_points):
        with savedState():
            stroke(*blue)
            oval(initial_point[0] - 5, initial_point[1] - 5, 10, 10)
            for index, p in enumerate(points):
                h = 10 if index == 0 else 6
                oval(p[0] - h/2, p[1] - h/2, h, h)
            line(points[0], initial_point)

    return points
```

And here's some javascript:

```javascript
function calcWave(vel,values) {
  // Increment theta (try different values for 
  // 'angular velocity' here
  theta += vel;
  // For every x value, calculate a y value with sine function
  var x = theta;
  for (var i = 0; i < values.length; i++) {
    values[i] = sin(x)*amplitude;
    x+=dx;
  }
}

function fixedCircle (vel, color) {
    theta += vel;
    fill(color)
    noStroke()
    ellipse(100, height/2 + amplitude * sin(25 * dx + theta), 20, 20);
}
```

Nice.