(function () {
  function one() {
    return 1;
  }

  function two() {
    return one() + one();
  }

  function three() {
    return two() + one();
  }

  function four(){
    return two() + two();
  }

  return three() + four();
}());
