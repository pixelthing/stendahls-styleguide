var guidePull = function(url) {
  
  return new Promise(function (resolve, reject) {
    fetchish(url).then(function(response) {
      
      resolve(response)
      
    }).catch(function(error) {
      
      reject(error)
      
    });
  });
  
}