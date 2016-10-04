(function () {
  function one() {
    throw new Error('oops');
  }

  function two() {
    return one();
  }

  function three() {
    return two();
  }

  function four() {
    return three();
  }

  return four();
}());
