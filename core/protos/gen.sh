#!/bin/bash

#basepath=$(cd `dirname $0`; pwd)
basepath=$(pwd)
echo "当前工作目录:${basepath}"
file_path=$1
work_path=${basepath}/${file_path}
echo "当前文件目录:${work_path}"

GRPC_CPP_PLUGIN=grpc_cpp_plugin
GRPC_CPP_PLUGIN_PATH=`which ${GRPC_CPP_PLUGIN}`

echo "*** 开始生成文件 ***"
echo
  
for file in $(ls ${file_path}/*.proto) 
do
	protoc -I=. -I/usr/local/include -I${basepath}/third_party --js_out=import_style=commonjs,binary:. $file
	echo [$file] Generate go file ---- OK!

	# protoc --cpp_out=./ $file
	# protoc --grpc_out=./ --plugin=protoc-gen-grpc=${GRPC_CPP_PLUGIN_PATH} $file
	# echo [$file] Generate C++ file ---- OK!
done

echo
echo "*** 全部生成完成 ***"