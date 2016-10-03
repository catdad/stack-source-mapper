(function () {
  function one() {
    throw new Error('oops');
  }

  function two() {
    return one() + one();
  }

  function three() {
    return two() + one();
  }

  function four() {
    return three() + one();
  }

  return four();
}());
