#!/bin/bash
if [ "$1" = "dev" ];then
    echo "run dev" 
    npm run dev
elif [ "$1" = "tgz" ];then
    echo "run prod && tar tgz"
    npm run build:prod && tar -zcvf mine_dist.tgz dist
else
    echo "run prod"
    npm run build:prod
fi