// Simple 3D house with hipped roof
// Units: millimeters

// ---------- Parameters ----------
house_size      = 50;   // footprint size X and Y (<= 50mm)
wall_height     = 30;   // height of vertical walls
roof_height     = 20;   // extra height of roof above walls
wall_thickness  = 2;    // for door/window outlines if used

// Roof overhang relative to walls
roof_overhang   = 3;

// Chimney parameters
chimney_width   = 8;
chimney_depth   = 8;
chimney_height  = 18;
chimney_offsetX = -10;  // relative to center
chimney_offsetY = 5;

// Window/door sizes (for shallow embossed rectangles)
win_size        = [8, 8, 0.8];    // width, height, depth
door_size       = [12, 18, 0.8];

// ---------- Main assembly ----------
module house_body() {
    // Main cube of the house
    translate([-house_size/2, -house_size/2, 0])
        cube([house_size, house_size, wall_height], center = false);
}

module hipped_roof() {
    // Hipped roof represented as a pyramid frustum
    lower = house_size + 2*roof_overhang;
    upper = house_size * 0.25;  // small flat top at ridge

    translate([0, 0, wall_height])
        polyhedron(
            points = [
                // lower square (z = 0)
                [-lower/2, -lower/2, 0],
                [ lower/2, -lower/2, 0],
                [ lower/2,  lower/2, 0],
                [-lower/2,  lower/2, 0],

                // upper square (z = roof_height)
                [-upper/2, -upper/2, roof_height],
                [ upper/2, -upper/2, roof_height],
                [ upper/2,  upper/2, roof_height],
                [-upper/2,  upper/2, roof_height]
            ],
            faces = [
                // bottom ring (ignored, inside)
                [0,1,2,3],

                // sides
                [0,1,5,4],
                [1,2,6,5],
                [2,3,7,6],
                [3,0,4,7],

                // top
                [4,5,6,7]
            ]
        );
}

module chimney() {
    translate([chimney_offsetX - chimney_width/2,
               chimney_offsetY - chimney_depth/2,
               wall_height + roof_height*0.4])  // sink it into roof a bit
        cube([chimney_width, chimney_depth, chimney_height], center = false);
}

// Embossed window on front face
module window_at(x, z_center) {
    translate([x - win_size[0]/2,
               -house_size/2 - 0.01,           // slight offset in front
               z_center - win_size[1]/2])
        cube(win_size, center = false);
}

// Embossed door on front face
module door() {
    translate([-door_size[0]/2,
               -house_size/2 - 0.01,
               0])
        cube(door_size, center = false);
}

// ---------- Combine everything ----------
difference() {
    union() {
        house_body();
        hipped_roof();
        chimney();
    }

    // (Optional) cut out door and windows instead of embossing:
    // Uncomment below if you want real openings:
    /*
    window_at(-house_size/4, wall_height*0.6);
    window_at( house_size/4, wall_height*0.6);
    door();
    */
}

// If you prefer embossed instead of cut-outs, comment out the "difference()"
// block above and use this union instead:
//
// union() {
//     house_body();
//     hipped_roof();
//     chimney();
//
//     window_at(-house_size/4, wall_height*0.6);
//     window_at( house_size/4, wall_height*0.6);
//     door();
// }