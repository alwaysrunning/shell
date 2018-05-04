#!/bin/bash

dir='/apps/data/web/working/f2e/vue-build'
#获取当前路径
cur_dir=$PWD 

#获取当前路径下的父文件名
pro_name=${PWD##*/}

#获取命令行中的第一个参数
env=$1


# -f 文件  -n 字符串  -d目录

if [ ! -f "$cur_dir/package.json" ]; then
	echo 'This is not a vue project root dir.'
	exit 1;
fi

if [ ! -d "$PWD/node_modules" ]; then
   echo $cur_dir
fi

# wc -L 获取当前文件目录在第几行
hasMkPlugin=`cd $PWD/src && ls -1 | grep "^mock" | wc -L`;
if [ $hasMkPlugin != 0 ]; then
    cd $PWD/src && ls -1 | grep "^mock" | xargs rm -r
fi

#sed -i "s#匹配到的内容#替换的内容#g" `grep -rl '/fonts’ $cur_dir`
if [ -n "$(grep -rl '/fonts' $cur_dir/src/)" ]; then
  echo $(grep -rl '/fonts' $cur_dir/src/)
# sed -i "s#/fonts#/http:wx.yunhou.com/fonts/images#g" `grep -rl '/fonts' $cur_dir/src/ `
fi

# scp 参数 要拷贝的对象 拷贝的地址
if [ $env='pro' ]; then
 # scp -r $cur_dir/src/* 10.200.52.183:/apps/svr/server/	
  echo $env
fi

# 获取用户输入的值
#read -p "Enter tag not include Enter tag, not include "v|r" ('$preTag' ->?): "
#echo $REPLY

. $cur_dir/yaml.sh; 
eval $(parse_yaml $cur_dir/config.yml) 

echo $static_repository_url
