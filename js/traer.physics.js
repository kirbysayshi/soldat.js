var Attraction = function (a, b, k, distanceMin) {
  var that = {},
      on = true,
      distanceMinSquared = Math.pow(distanceMin, 2);

  that.toString = function () {
    return "a: " + a +
           "\nb: " + b +
           "\nk: " + k +
           "\ndistanceMin " + distanceMin;
  };

  that.setA = function (p) {
    a = p;
  };

  that.setB = function (p) {
    b = p;
  };

  that.getMinimumDistance = function () {
    return distanceMin;
  };

  that.setMinimumDistance = function (d) {
    distanceMin = d;
    distanceMinSquared = Math.pow(d, 2);
  };

  that.turnOff = function () {
    on = false;
  };

  that.turnOn = function () {
    on = true;
  };

  that.setStrength = function (newK) {
    k = newK;
  };

  that.getOneEnd = function () {
    return a;
  };

  that.getTheOtherEnd = function () {
    return b;
  };

  that.apply = function () {
    if (on && (a.isFree() || b.isFree())) {
      var a2bX = a.position().x() - b.position().x(),
          a2bY = a.position().y() - b.position().y(),
          a2bZ = a.position().z() - b.position().z(),
          a2bDistanceSquared = a2bX*a2bX + a2bY*a2bY + a2bZ*a2bZ;

      if (a2bDistanceSquared < distanceMinSquared) {
        a2bDistanceSquared = distanceMinSquared;
      };

      var force = k * a.mass() * b.mass() / a2bDistanceSquared,
          length = Math.sqrt(a2bDistanceSquared);

      a2bX /= length;
      a2bY /= length;
      a2bZ /= length;

      a2bX *= force;
      a2bY *= force;
      a2bZ *= force;

      if (a.isFree()) {
        a.force().add(-a2bX, -a2bY, -a2bZ);
      };
      if (b.isFree()) {
        b.force().add(a2bX, a2bY, a2bZ);
      };
    };
  };

  that.getStrength = function () {
    return k;
  };

  that.isOn = function () {
    return on;
  };

  that.isOff = function () {
    return !on;
  };

  return that;
};
var EulerIntegrator = function (s) {
  var that = {};

  that.step = function (t) {
    s.clearForces();
    s.applyForces();

    for (var i = 0; i < s.numberOfParticles(); i++) {
      var p = s.getParticle(i);
      
      if (p.isFree()) {
        var force = p.force(),
            veloc = p.velocity();
            multi = p.mass() * t;

        p.velocity().add(force.x() / multi, 
                         force.y() / multi, 
                         force.z() / multi);

        p.position().add(veloc.x() / t, veloc.y() / t, veloc.z() / t);
      
      };
    };
  };

  return that;
};
var ModifiedEulerIntegrator = function (s) {
  var that = {};

  that.step = function (t) {
    s.clearForces();
    s.applyForces();

    var halfTSquared = 2.5 * Math.pow(t, 2);
    
    for (var i = 0; i < s.numberOfParticles(); i++) {
      p = s.getParticle(i);
      if (p.isFree()) {
        var ax = p.force().x() / p.mass(),
            ay = p.force().y() / p.mass(),
            az = p.force().z() / p.mass();

        
        p.position().add(p.velocity().x() / t, p.velocity().y() / t, p.velocity().z() / t);
        p.position().add(ax * halfTSquared, ay * halfTSquared, az * halfTSquared);
        p.velocity().add(ax / t, ay / t, az / t);
      };
    };
  };

  return that;
}

var Particle = function (mass) {
  var that = {}, 
      position = new Vector3D(), 
      velocity = new Vector3D(), 
      force = new Vector3D(), 
      age = 0, 
      dead = false,
      fixed = false;
  
  that.toString = function () {
    return "position: " + position +
           "\n velocity: " + velocity +
           "\n force: " + force +
           "\n age: " + age +
           "\n dead: " + dead +
           "\n fixed: " + fixed;
  };

  that.distanceTo = function (p) {
    return that.position().distanceTo(p.position());
  };

  that.makeFixed = function () {
    fixed = true;
    velocity.clear();
  };

  that.isFixed = function () {
    return fixed;
  };

  that.isFree = function () {
    return !fixed;
  };

  that.position = function () {
    return position;
  };

  that.velocity = function () {
    return velocity;
  };

  that.mass = function () {
    return mass;
  };

  that.setMass = function (m) {
    mass = m;
  };

  that.force = function () {
    return force;
  };

  that.age = function () {
    return age;
  };

  that.reset = function () {
    age = 0;
    dead = false;
    position.clear();
    velocity.clear();
    force.clear();
    mass = 1;
  };

  return that;
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var ParticleSystem = function () {
  var that = {},
      integrator = new RungeKuttaIntegrator(that),
      particles = [],
      springs = [],
      attractions = [],
      customForces = [],
      gravity = new Vector3D(),
      drag,
      hasDeadParticles = false,
      err = function (method) {
        throw 'Invalid number of arguments to ' + method;
      },
      construct = function (args) { 
        switch (args.length) {
          case 2:
            gravity.set(0, args[0], 0);
            drag = args[1];
            break;
          case 4:
            gravity.set(args[0], args[1], args[2]);
            drag = args[3];
            break;
          case 0:
            gravity.set(0, ParticleSystem.DEFAULT_GRAVITY, 0);
            drag = ParticleSystem.DEFAULT_DRAG;
            break;
          default:
            err('constructor');
        };
      };

  that.setIntegrator = function (integrator) {
    switch (integrator) {
      case ParticleSystem.RUNGE_KUTTA:
        integrator = new RungeKuttaIntegrator(that);
        break;
      case ParticleSystem.MODIFIED_EULER:
        integrator = new ModifiedEulerIntegrator(that);
        break;
      default:
        throw 'No such integrator.';
    };
  };

  that.setGravity = function () {
    switch (arguments.length) { 
      case 1:
        gravity.set(0, arguments[0], 0);
        break;
      case 3:
        gravity.set(arguments[0], arguments[1], arguments[2]);
        break;
      default:
        err('setGravity');
    };
  };

  that.setDrag = function (d) {
    drag = d;
  };

  that.tick = function () {
    switch (arguments.length) {
      case 0:
        integrator.step(1);
        break;
      case 1:
        integrator.step(arguments[0]);
        break;
      default:
        err('tick');
    };
  };

  that.makeParticle = function () {
    var mass = 1.0, x = 0, y = 0, z = 0;
    
    switch (arguments.length) {
      case 0:
        break;
      case 4:
        mass = arguments[0];
        x = arguments[1];
        y = arguments[2];
        z = arguments[3];
        break;
      default:
        err('makeParticle');
    };

    var p = new Particle(mass);
    p.position().set(x, y, z);
    particles.push(p);
    return p;
  };

  that.makeSpring = function (a, b, ks, d, r) {
    var s = new Spring(a, b, ks, d, r);
    springs.push(s);
    return s;
  };

  that.clear = function () {
    particles = [];
    springs = [];
    attractions = [];
  };

  that.makeAttraction = function (a, b, k, minDistance) {
    var m = new Attraction(a, b, k, minDistance);
    attractions.push(m);
    return m;
  };

  that.applyForces = function () {
    for (var i = 0; i < particles.length; i++) {
      var particle = particles[i];
      if (!gravity.isZero()) {
        particle.force().add(gravity);
      };
      particle.force().add(particle.velocity().x() * -drag,
                           particle.velocity().y() * -drag,
                           particle.velocity().z() * -drag);
    };
    for (var i = 0; i < springs.length; i++) {
      springs[i].apply();
    };
    for (var i = 0; i < attractions.length; i++) {
      attractions[i].apply();
    };
    for (var i = 0; i < customForces.length; i++) {
      customForces[i].apply();
    };
  };

  that.clearForces = function () {
    for (var i = 0; i < particles.length; i++) {
      particles[i].force().clear();
    };
  };

  that.numberOfParticles = function () {
    return particles.length;
  };

  that.numberOfSprings = function () {
    return springs.length;
  };

  that.numberOfAttractions = function () {
    return attractions.length;
  };

  that.getParticle = function (i) {
    return particles[i];
  };

  that.getSpring = function (i) {
    return springs[i];
  };

  that.getAttraction = function (i) {
    return attractions[i];
  };

  that.addCustomForce = function (f) {
    customForces.push(f);
  };

  that.numberOfCustomForces = function () {
    return customForces.length;
  };

  that.getCustomForce = function (i) {
    return customForces[i];
  };

  that.removeParticle = function (i) {
    var p = that.getParticle(i);
    particles.remove(i, i + 1);
    return p;
  };

  that.removeSpring = function (i) {
    var s = that.getSpring(i);
    springs.remove(i, i + 1);
    return s;
  };

  that.removeAttraction = function (i) {
    var a = that.getAttraction(i);
    attractions.remove(i, i + 1);
    return a;
  };

  that.removeCustomForce = function (i) {
    var f = that.getCustomForce(i);
    customForces.remove(i);
    return f;
  };

  that.particles = function () {
    return particles;
  };

  construct(arguments);

  return that;
};

ParticleSystem.RUNGE_KUTTA = 0;
ParticleSystem.MODIFIED_EULER = 1;

ParticleSystem.DEFAULT_GRAVITY = 0;
ParticleSystem.DEFAULT_DRAG = 0.001;
var RungeKuttaIntegrator = function (s) {
  var that = {},
      originals = { 
        positions: [],
        velocities: []
      },
      kForces = [],
      kVelocities = [],
      allocateParticles = function () {
        while (s.numberOfParticles() > originals.positions.length) {
          for (var name in originals) {
            originals[name].push(new Vector3D());
          };
          for (var i = 0; i < RungeKuttaIntegrator.NUM_FORCES; i++) {
            kForces[i].push(new Vector3D());
            kVelocities[i].push(new Vector3D());
          };
        };
      },
      construct = function () {
        for (var i = 0; i < RungeKuttaIntegrator.NUM_FORCES; i++) {
          kForces.push([]);
          kVelocities.push([]);
        };
      };

  that.step = function (deltaT) {
    allocateParticles();

    for (var i = 0; i < s.particles().length; i++) {
      var p = s.getParticle(i);
      if (p.isFree()) {		
        originals.positions[i] = p.position().copy();
        originals.velocities[i] = p.velocity().copy();
      };

      p.force().clear();
    };


    for (var k = 0; k < RungeKuttaIntegrator.NUM_FORCES; k++) {
      s.applyForces();

      for (var i = 0; i < s.particles().length; i++) {
        var p = s.getParticle(i);
        if (p.isFree()) {
          kForces[k][i] = p.force().copy();
          kVelocities[k][i] = p.velocity().copy();
        };

        p.force().clear();
      };

      if (k == RungeKuttaIntegrator.NUM_FORCES - 1) {
        break;
      };

      for (var i = 0; i < s.particles().length; i++) {
        var p = s.getParticle(i);
        if (p.isFree()) {
          var originalPosition = originals.positions[i];
          var kVelocity = kVelocities[k][i];

          p.position().setX(originalPosition.x() + kVelocity.x() * 0.5 * 
                            deltaT);
          p.position().setY(originalPosition.y() + kVelocity.y() * 0.5 * 
                            deltaT);
          p.position().setZ(originalPosition.z() + kVelocity.z() * 0.5 * 
                            deltaT);

          var originalVelocity = originals.velocities[i];
          var kForce = kForces[k][i];

          p.velocity().setX(originalVelocity.x() + kForce.x() * 0.5 * deltaT / 
                            p.mass());
          p.velocity().setY(originalVelocity.y() + kForce.y() * 0.5 * deltaT / 
                            p.mass());
          p.velocity().setZ(originalVelocity.z() + kForce.z() * 0.5 * deltaT / 
                            p.mass());
        };
      };

      for (var i = 0; i < s.particles().length; i++) {
        var p = s.getParticle(i);
        p.age += deltaT;
        if (p.isFree()) {
          var originalPosition = originals.positions[i];
          var k1Velocity = kVelocities[0][i];
          var k2Velocity = kVelocities[1][i];
          var k3Velocity = kVelocities[2][i];
          var k4Velocity = kVelocities[3][i];

          p.position().setX(originalPosition.x() + deltaT / 6.0 * 
                            (k1Velocity.x() + 2.0 * k2Velocity.x() + 2.0 * 
                            k3Velocity.x() + k4Velocity.x()));
          p.position().setY(originalPosition.y() + deltaT / 6.0 * 
                            (k1Velocity.y() + 2.0 * k2Velocity.y() + 2.0 * 
                            k3Velocity.y() + k4Velocity.y()));
          p.position().setZ(originalPosition.z() + deltaT / 6.0 * 
                            (k1Velocity.z() + 2.0 * k2Velocity.z() + 2.0 * 
                            k3Velocity.z() + k4Velocity.z()));

          var originalVelocity = originals.velocities[i];
          var k1Force = kForces[0][i];
          var k2Force = kForces[0][i];
          var k3Force = kForces[0][i];
          var k4Force = kForces[0][i];

          p.velocity().setX(originalVelocity.x() + deltaT / (6.0 * p.mass()) * 
                            (k1Force.x() + 2.0 * k2Force.x() + 2.0 * 
                            k3Force.x() + k4Force.x()));
          p.velocity().setY(originalVelocity.y() + deltaT / (6.0 * p.mass()) * 
                            (k1Force.y() + 2.0 * k2Force.y() + 2.0 * 
                            k3Force.y() + k4Force.y()));
          p.velocity().setZ(originalVelocity.z() + deltaT / (6.0 * p.mass()) *
                            (k1Force.z() + 2.0 * k2Force.z() + 2.0 * 
                            k3Force.z() + k4Force.z()));
        };
      };
    };
  };

  construct();

  return that;
};

RungeKuttaIntegrator.NUM_FORCES = 4;
var Spring = function (a, b, springConstant, damping, restLength) {
  var that = {},
      on = true;

  that.toString = function () {
    return "a: " + a + 
           "\nb: " + b + 
           "\nspringConstant: " + springConstant +
           "\ndamping: " + damping +
           "\nrestLength: " + restLength;
  };

  that.turnOff = function () {
    on = false;
  };

  that.turnOn = function () {
    on = true;
  };

  that.isOn = function () {
    return on;
  };

  that.isOff = function () {
    return !on;
  };

  that.getOneEnd = function () {
    return a;
  };

  that.getTheOtherEnd = function () {
    return b;
  };

  that.currentLength = function () {
    return a.position().distanceTo(b.position());
  };

  that.restLength = function () {
    return restLength;
  };

  that.strength = function () {
    return springConstant;
  }

  that.setStrength = function (ks) {
    springConstant = ks;
  };

  that.damping = function () {
    return damping;
  };

  that.setDamping = function (d) {
    damping = d;
  };

  that.setRestLength = function (l) {
    restLength = l;
  };

  that.apply = function () {
    if (on && (a.isFree() || b.isFree())) {
      var a2bX = a.position().x() - b.position().x(),
          a2bY = a.position().y() - b.position().y(),
          a2bZ = a.position().z() - b.position().z(),
          a2bDistance = Math.sqrt(Math.pow(a2bX, 2) +
                                  Math.pow(a2bY, 2) +
                                  Math.pow(a2bZ, 2));

      if (a2bDistance == 0) {
        a2bX = 0;
        a2bY = 0;
        a2bZ = 0;
      } else {
        a2bX /= a2bDistance;
        a2bY /= a2bDistance;
        a2bZ /= a2bDistance;
      };

      var springForce = -(a2bDistance - restLength) * springConstant,
          vA2bX = a.velocity().x() - b.velocity().x(),
          vA2bY = a.velocity().y() - b.velocity().y(),
          vA2bZ = a.velocity().z() - b.velocity().z(),
          dampingForce = -damping * (a2bX * vA2bX + a2bY * vA2bY + a2bZ * vA2bZ),
          r = springForce + dampingForce;

      a2bX *= r;
      a2bY *= r;
      a2bZ *= r;

      if (a.isFree()) {
        a.force().add(a2bX, a2bY, a2bZ);
      };
      if (b.isFree()) {
        b.force().add(-a2bX, -a2bY, -a2bZ);
      };
    };
  };

  return that;
};
var Vector3D = function () {
  var that = {}, 
      x = 0, 
      y = 0, 
      z = 0,
      err = function (method) {
        throw 'Invalid number of arguments to ' + method;
      },
      construct = function (args) {
        switch (args.length) {
          case 0:
            break;
          case 1:
            var p = args[0];
            x = p.x();
            y = p.y();
            z = p.z();
            break;
          case 3:
            x = args[0];
            y = args[1];
            z = args[2];
            break;
          default:
            err('constructor');
        };
      };

  that.x = function () {
    return x;
  };
  
  that.y = function () {
    return y;
  };
  
  that.z = function () {
    return z;
  };

  that.setX = function (newX) {
    x = newX;
  };

  that.setY = function (newY) {
    y = newY;
  };

  that.setZ = function (newZ) {
    z = newZ;
  };

  that.set = function () {
    switch (arguments.length) {
      case 1:
        var p = arguments[0];
        x = p.x();
        y = p.y();
        z = p.z();
        break;
      case 3:
        x = arguments[0];
        y = arguments[1];
        z = arguments[2];
        break;
      default:
        err('set');
    };
  };

  that.add = function () {
    switch (arguments.length) {
      case 1:
        var p = arguments[0];
        x += p.x();
        y += p.y();
        z += p.z();
        break;
      case 3:
        x += arguments[0];
        y += arguments[1];
        z += arguments[2];
        break;
      default:
        err('add');
    };
  };

  that.subtract = function () {
    switch (arguments.length) {
      case 1:
        var p = arguments[0];
        x -= p.x();
        y -= p.y();
        z -= p.z();
        break;
      case 3:
        x -= arguments[0];
        y -= arguments[1];
        z -= arguments[2];
        break;
      default:
        err('subtract');
    };
  };

  that.multiplyBy = function (f) {
    x *= f;
    y *= f;
    z *= f;
    return that;
  };

  that.distanceTo = function () {
    switch (arguments.length) {
      case 1:
        return Math.sqrt(that.distanceSquaredTo(arguments[0]));
      case 3:
        return Math.sqrt(that.distanceSquaredTo(new Vector3D(arguments[0],
                                                             arguments[1],
                                                             arguments[2])));
      default:
        err('distanceTo');
    };
  };

  that.distanceSquaredTo = function (p) {
    return Math.pow(x - p.x(), 2) + 
           Math.pow(y - p.y(), 2) +
           Math.pow(z - p.z(), 2);
  };

  that.dot = function (p) {
    return x * p.x() + y * p.y() + z * p.z();
  };

  that.length = function () {
    return Math.sqrt(that.lengthSquared());
  };

  that.lengthSquared = function () {
    return Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2); 
  };

  that.clear = function () {
    x = 0;
    y = 0;
    z = 0;
  };

  that.toString = function () {
    return "(" + x + ", " + y + ", " + z + ")";
  };

  that.cross = function () {
    return new Vector3D(y * p.z() - z * p.y(),
                        x * p.z() - z * p.x(),
                        x * p.y() - y * p.x());
  };

  that.isZero = function () {
    return x == 0 && y == 0 && z == 0;
  };

  that.copy = function () {
    return new Vector3D(that);
  };

  construct(arguments);

  return that;
};
