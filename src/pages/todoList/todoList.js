/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-quotes */
import { useState, useRef } from "react";
import { View, Text, Input, Button, Checkbox, Image } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import "./todoList.scss";

const isH5 = process.env.TARO_ENV; // h5/weapp
// console.log(isH5,'isH5'); // 如果使用npm run dev:h5 则编译时会自动将process.env.TARO_ENV转换成'h5'

export default function todoList() {
  const [todoList1, setTodoList1] = useState([]);
  const [order, setOrder] = useState(Taro.getStorageSync("todo"));
  const $InputRef = useRef();
  const [avatar, setAvatar] = useState("");

  // 只会在最开始加载一次，后面重绘不会再进来！
  useLoad(() => {
    setTodoList1(Taro.getStorageSync("todo") || []);
    if (!Taro.getStorageSync("order")) {
      Taro.setStorageSync("order", false);
    }
  });

  const createTodo = (text) => {
    const date = Date.now(); // 获取时间戳
    return {
      text,
      isemergent: false,
      date,
    };
  };

  // 添加TODO
  const onAddToDo = () => {
    const targetValue = $InputRef.current?.value;
    if (!!todoList1.find((todo) => todo.text == targetValue)) {
      return Taro.showToast({ title: "已经添加过了！！", icon: "none" });
    }
    if (targetValue.trim() === "") {
      return Taro.showToast({ title: "输入不能为空", icon: "none" }); // 弹窗提示
    }
    const newTodo = [...todoList1, createTodo(targetValue)];
    setTodoList1(newTodo);
    Taro.setStorageSync("todo", newTodo); // 本地化存储 这种方式是同步存取，对象形式是异步，会慢一拍
    $InputRef.current.value = "";
    console.log($InputRef.current.value, "inputref");
  };
  // 删除
  const onDelToDo = (key) => {
    todoList1.splice(key, 1);
    setTodoList1([...todoList1]);
    Taro.setStorageSync("todo", todoList1);
  };
  // 修改紧急度的回调
  const checkedHandler = (key) => {
    // console.log(key);
    // 使用浅拷贝创建副本确保了修改副本时不会影响到原始数据，同时又能正确地更新状态和数据。
    const updatedTodoList = [...todoList1];
    todoList1[key].isemergent = !todoList1[key].isemergent; // 解决setState异步的问题！！！
    setTodoList1(updatedTodoList);
    Taro.setStorageSync("todo", updatedTodoList);
  };
  // 排序回调
  const sortHandler = () => {
    const newOrder = !Taro.getStorageSync("order");
    Taro.setStorageSync("order", newOrder);
    setOrder(newOrder);
    if (!newOrder) {
      todoList1.sort((a, b) => a.date - b.date); // 会更改原数组，但是想生效还是要用set
    } else {
      todoList1.sort((a, b) => b.isemergent - a.isemergent);
    }
    Taro.setStorageSync("todo", todoList1);
    setTodoList1([...todoList1]);
  };
  // 添加头像
  const onChooseAvatar = (e) => {
    setAvatar(e.detail.avatarUrl);
  };

  return (
    <View className="box">
      {/* 小程序独有 */}
      {isH5 === "weapp" && (
        <View>
          {!avatar && (
            <Button
              className="avatar-warper"
              open-type="chooseAvatar"
              onChooseAvatar={onChooseAvatar}
            >
              <View>添加头像</View>
            </Button>
          )}
          {avatar && <View className="avatar" style={{margin:'0 auto'}}><Image src={avatar} ></Image></View>}
        </View>
      )}

      <View className="header">
        <Text>峰峰的ToDoList</Text>
      </View>
      <Input
        className="todo-input"
        placeholder="请输入待办事项"
        ref={$InputRef}
      ></Input>

      <Button className="todo-btn" onClick={onAddToDo}>
        添加ToDo
      </Button>

      <View className="todo-body">
        <View className="title-header">
          <Text className="title-item">TODO</Text>
          <Text className="title-item">重要性</Text>
          <Text className="title-item" onClick={sortHandler}>
            排序
          </Text>
          <Text className="title-item">操作</Text>
        </View>

        <View style={{ border: "1px solid lightgray" }}>
          {todoList1.map((todo, key) => (
            <View key={key}>
              <View className="todo-item">
                <Text className="todo-info">{todo.text}</Text>
                <View onClick={() => checkedHandler(key)}>
                  <Checkbox
                    // className="todo-check"
                    checked={todo.isemergent}
                  ></Checkbox>
                  {todo.isemergent ? "紧急" : "一般"}
                </View>
                <View className="todo-order">{order ? "优先级" : "默认"}</View>
                <Text className="btn_delete" onClick={() => onDelToDo(key)}>
                  删除
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
