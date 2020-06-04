const deleteProduct = (btn) => {
    const token = btn.parentNode.querySelector('[name = _csrf]').value;
    const productId = btn.parentNode.querySelector('[name = productId]').value;
    const productElement = btn.closest('article');
    console.log(productElement)

    //using then block --es7
    fetch(`/admin/product/${productId}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': token
        }
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        console.log(data);
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err => {
        console.log(err, 'error ocurred')
    })
     

//      using async await es8
//      const delAsync = async () => {
//         try {
//             const result = await fetch('/admin/product/' + productId, {
//                 method: 'DELETE',
//                 headers: {
//                     'csrf-token': token
//                 }
//             });
           
//             const res = await result.json();
//             //console.log(res);
//             productElement.parentNode.removeChild(productElement)
//         }
//         catch(err) {
//             console.log(err, 'error ocurred');
//         }
//      }

//      delAsync()
// 

}