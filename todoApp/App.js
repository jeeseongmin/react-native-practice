import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { theme } from "./colors";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const CATEGORY_KEY = "@toDoCategory";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const [editInfo, setEditInfo] = useState({
    isEdit: false,
    key: "",
    text: "",
    working: "",
  });

  const setEditMode = (flag, key, text, working) => {
    const cp = { ...editInfo };
    cp.isEdit = flag;
    cp.key = flag ? key : "";
    cp.text = flag ? text : "";
    cp.woring = flag ? working : "";
    setEditInfo(cp);
  };

  const onChangeText = (mode, payload) => {
    if (mode === "create") {
      setText(payload);
    } else if (mode === "edit") {
      const cp = { ...editInfo };
      cp.text = payload;
      setEditInfo(cp);
    }
  };

  const check = async (key) => {
    try {
      const newToDos = { ...toDos };
      newToDos[key].checked = !newToDos[key].checked;
      setToDos(newToDos);
      await saveToDos(newToDos);
    } catch (e) {}
  };

  const saveToDos = async (toSave) => {
    try {
      const s = JSON.stringify(toSave);
      // await AsyncStorage.clear();
      await AsyncStorage.setItem(STORAGE_KEY, s);
    } catch (e) {}
  };

  const load = async () => {
    try {
      const toDo = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(toDo) === null ? {} : JSON.parse(toDo));
      const cate = await AsyncStorage.getItem(CATEGORY_KEY);
      if (cate === null) {
        await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(true));
      } else setWorking(JSON.parse(cate));
    } catch (e) {}
  };

  const deleteToDo = async (key) => {
    try {
      const newToDos = { ...toDos };
      delete newToDos[key];
      setToDos(newToDos);
      await saveToDos(newToDos);
    } catch (e) {}
  };

  useEffect(() => {
    // AsyncStorage.clear();
    load();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, checked: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
    inputRef.current.focus();
  };

  const editToDo = async () => {
    if (editInfo.text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [editInfo.key]: { text: editInfo.text, working, checked: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
    inputRef.current.focus();
    setEditMode(false);
  };

  const saveCategory = async (flag) => {
    await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(flag));
    setWorking(flag);
  };

  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => saveCategory(true)}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.grey,
            }}>
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => saveCategory(false)}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}>
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={(e) => onChangeText("create", e)}
          returnKeyType='done'
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
          ref={inputRef}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            editInfo.isEdit && key === editInfo.key ? (
              <TouchableOpacity
                onLongPress={() => setEditMode(true, key, toDos[key].text)}
                key={key}>
                <View style={styles.editToDo}>
                  <TextInput
                    onSubmitEditing={editToDo}
                    style={styles.editInput}
                    onChangeText={(e) => onChangeText("edit", e)}
                    value={editInfo.text}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onLongPress={() =>
                  setEditMode(true, key, toDos[key].text, toDos[key].working)
                }
                key={key}>
                <View style={styles.toDo}>
                  {toDos[key].checked ? (
                    <Text style={styles.checkedToDoText}>
                      {toDos[key].text}
                    </Text>
                  ) : (
                    <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  )}
                  <View style={styles.btnContainer}>
                    {toDos[key].checked ? (
                      <TouchableOpacity
                        style={{ marginRight: 5 }}
                        onPress={() => check(key)}>
                        <MaterialCommunityIcons
                          name='checkbox-marked'
                          size={18}
                          color={theme.grey}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{ marginRight: 5 }}
                        onPress={() => check(key)}>
                        <MaterialCommunityIcons
                          name='checkbox-blank-outline'
                          size={18}
                          color='white'
                        />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <AntDesign name='delete' size={18} color={theme.grey} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 25,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 25,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 15,
  },
  editInput: {
    backgroundColor: "white",
    fontSize: 15,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 17,
  },
  editToDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    borderRadius: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkedToDoText: {
    color: theme.grey,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  toDoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
