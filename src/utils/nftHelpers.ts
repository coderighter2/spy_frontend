import BigNumber from "bignumber.js";
import tokens from "config/constants/tokens";

export const getFixRate = (grade: number, quality: number, nftAddress?: string) => {
    if (nftAddress?.toLowerCase() === tokens.signature.address.toLowerCase()) {
        if( grade === 1 ){
            return new BigNumber(quality).multipliedBy(40000).dividedBy(5000).plus(200000);
        }
        
        if( grade === 2){
            return new BigNumber(quality).minus(5000).multipliedBy(40000).dividedBy(2000).plus(240000);
        }
        
        if( grade === 3){
            return new BigNumber(quality).minus(7000).multipliedBy(40000).dividedBy(1500).plus(280000);
        }
        
        if( grade === 4){
            return new BigNumber(quality).minus(8500).multipliedBy(40000).dividedBy(1000).plus(320000);
        }
        
        return new BigNumber(quality).minus(9500).multipliedBy(40000).dividedBy(500).plus(360000);
    }

    if( grade === 1 ){
        return new BigNumber(quality).multipliedBy(10000).dividedBy(5000).plus(110000);
    }
    
    if( grade === 2){
        return new BigNumber(quality).minus(5000).multipliedBy(10000).dividedBy(3000).plus(120000);
    }
    
    if( grade === 3){
        return new BigNumber(quality).minus(8000).multipliedBy(10000).dividedBy(1000).plus(130000);
    }
    
    if( grade === 4){
        return new BigNumber(quality).minus(9000).multipliedBy(20000).dividedBy(800).plus(140000);
    }
    
    if( grade === 5){
        return new BigNumber(quality).minus(9800).multipliedBy(20000).dividedBy(180).plus(160000);
    }
    return new BigNumber(quality).minus(9980).multipliedBy(20000).dividedBy(20).plus(180000);
}
