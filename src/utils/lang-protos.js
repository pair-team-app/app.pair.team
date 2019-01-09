

// Object.defineProperty(Array.prototype, 'unique', {
//     enumerable   : false,
//     configurable : false,
//     writable     : false,
//     value        : ()=> {
// 	    let pruned = this.concat();
// 	    for (let i=0; i<pruned.length; ++i) {
// 		    for (let j=i+1; j<pruned.length; ++j) {
// 			    if (pruned[i] === pruned[j]) {
// 				    pruned.splice(j--, 1);
// 			    }
// 		    }
// 	    }
//
// 	    return (pruned);
//     }
// });
