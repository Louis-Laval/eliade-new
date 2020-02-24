export let getNextIndex = (index, array) => {
    if(index === array.length - 1){
        return 0;
    }
    else {
        return index + 1;
    }
};

export let getPreviousIndex = (index, array) => {
    if(index === 0){
        return array.length - 1;
    }
    else {
        return index - 1;
    }
};