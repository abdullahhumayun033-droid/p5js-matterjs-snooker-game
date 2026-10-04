// CushionManager handles the creation, rendering, and visual effects of all snooker table cushions.
class CushionManager {
  constructor(world, tableMargin, tableLength, tableWidth, ballDiameter, pocketDiameter) {
    // Matter.js physics world
    this.world = world;

    // Table dimensions and measurements
    this.tableMargin = tableMargin;
    this.tableLength = tableLength;
    this.tableWidth = tableWidth;
    this.ballDiameter = ballDiameter;
    this.pocketDiameter = pocketDiameter;

    // Stores all cushion bodies and rendering data
    this.cushions = [];
  }

  // Generates a cushion body and rendering properties from a list of vertices
  createTableCushion(points) {
    // Calculate center point for Matter.js body positioning
    const center = {
      x: points.reduce((acc, p) => acc + p.x, 0) / points.length,
      y: points.reduce((acc, p) => acc + p.y, 0) / points.length
    };

    // Convert points to a Matter.js-friendly vertex array
    const verts = points.map(p => ({ x: p.x, y: p.y }));

    // Create static cushion body using provided vertices
    const body = Matter.Bodies.fromVertices(center.x, center.y, [verts], {
      isStatic: true,
      restitution: 0.85,  // Bounce property
      label: 'cushion'
    }, true);

    return {
      body,           // Matter.js body
      verts,          // Vertices for drawing
      color: color(30, 90, 30, 90), // Default cushion color (green, semi-transparent)
      flashTimer: 0   // Countdown for impact highlight
    };
  }

  // Constructs all cushions around the snooker table
  create() {
    this.cushions = [];

    // Cushion sizing and positioning offsets
    const wallThickness = this.ballDiameter * 0.85;
    const cushionInset = 4;
    const outerCushionExtension = 25;
    const innerCushionExtension = 15;

    const lx = this.tableMargin, rx = this.tableMargin + this.tableLength;
    const ty = this.tableMargin, by = this.tableMargin + this.tableWidth;
    const pD = this.pocketDiameter;
    const midX = lx + this.tableLength / 2;

    const pocketClearance = this.pocketDiameter * 0.9 + this.ballDiameter * 0.6;
    const chamfer = this.pocketDiameter * 0.75 + this.ballDiameter * 0.25;

    // Top-left cushion
    this.cushions.push(this.createTableCushion([
      { x: lx + pD + pocketClearance + cushionInset - outerCushionExtension, y: ty + wallThickness },
      { x: lx + pD + chamfer + cushionInset - outerCushionExtension, y: ty },
      { x: midX - pD - chamfer - cushionInset + innerCushionExtension, y: ty },
      { x: midX - pD - pocketClearance - cushionInset + innerCushionExtension, y: ty + wallThickness }
    ]));

    // Top-right cushion
    this.cushions.push(this.createTableCushion([
      { x: midX + pD + pocketClearance + cushionInset - innerCushionExtension, y: ty + wallThickness },
      { x: midX + pD + chamfer + cushionInset - innerCushionExtension, y: ty },
      { x: rx - pD - chamfer - cushionInset + outerCushionExtension, y: ty },
      { x: rx - pD - pocketClearance - cushionInset + outerCushionExtension, y: ty + wallThickness }
    ]));

    // Bottom-left cushion
    this.cushions.push(this.createTableCushion([
      { x: lx + pD + pocketClearance + cushionInset - outerCushionExtension, y: by - wallThickness },
      { x: lx + pD + chamfer + cushionInset - outerCushionExtension, y: by },
      { x: midX - pD - chamfer - cushionInset + innerCushionExtension, y: by },
      { x: midX - pD - pocketClearance - cushionInset + innerCushionExtension, y: by - wallThickness }
    ]));

    // Bottom-right cushion
    this.cushions.push(this.createTableCushion([
      { x: midX + pD + pocketClearance + cushionInset - innerCushionExtension, y: by - wallThickness },
      { x: midX + pD + chamfer + cushionInset - innerCushionExtension, y: by },
      { x: rx - pD - chamfer - cushionInset + outerCushionExtension, y: by },
      { x: rx - pD - pocketClearance - cushionInset + outerCushionExtension, y: by - wallThickness }
    ]));

    // Left vertical cushion
    this.cushions.push(this.createTableCushion([
      { x: lx + wallThickness, y: ty + pD + pocketClearance + cushionInset - outerCushionExtension },
      { x: lx, y: ty + pD + chamfer + cushionInset - outerCushionExtension },
      { x: lx, y: by - pD - chamfer - cushionInset + outerCushionExtension },
      { x: lx + wallThickness, y: by - pD - pocketClearance - cushionInset + outerCushionExtension }
    ]));

    // Right vertical cushion
    this.cushions.push(this.createTableCushion([
      { x: rx - wallThickness, y: ty + pD + pocketClearance + cushionInset - outerCushionExtension },
      { x: rx, y: ty + pD + chamfer + cushionInset - outerCushionExtension },
      { x: rx, y: by - pD - chamfer - cushionInset + outerCushionExtension },
      { x: rx - wallThickness, y: by - pD - pocketClearance - cushionInset + outerCushionExtension }
    ]));

    // Add all cushion bodies to the Matter.js world
    for (const c of this.cushions) {
      World.add(this.world, c.body);
    }
  }

  // Renders all cushion shapes and handles flash color reset
  draw() {
    for (const cushion of this.cushions) {
      if (cushion.flashTimer > 0) {
        cushion.flashTimer--;
        if (cushion.flashTimer === 0) {
          cushion.color = color(30, 90, 30, 90);  // Reset to base color
        }
      }

      fill(cushion.color);
      stroke(50, 100, 30);
      strokeWeight(1.5);
      beginShape();
      for (const v of cushion.verts) vertex(v.x, v.y);
      endShape(CLOSE);
    }
  }

  // Temporarily changes cushion color on impact
  highlightImpact(cushionBody) {
    const cushion = this.cushions.find(c => c.body === cushionBody);
    if (cushion) {
      cushion.color = color(255, 200, 50, 170); // Highlight color
      cushion.flashTimer = 12; // Duration to hold the highlight
    }
  }

  // Returns all cushion instances
  getCushions() {
    return this.cushions;
  }
}
