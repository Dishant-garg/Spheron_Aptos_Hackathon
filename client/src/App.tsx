import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import {marked} from 'marked'; // Import the marked library


// Import the Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");


const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
const moduleAddress = "c77648c353a1c7b7589371c15174a326721e0b26bd818b700b967baebbedd2e9";

function App() {
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const { account, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>("");
  const [aiPrompt, setAIPrompt] = useState<string>(""); // For capturing AI prompt
  const [aiTasks, setAITasks] = useState<string[]>([]); // To store AI-generated tasks

  type Task = {
    address: string;
    completed: boolean;
    content: string;
    task_id: string;
  };

  const [tasks, setTasks] = useState<Task[]>([]);

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

  const fetchList = async () => {
    if (!account) return [];
    try {
      const todoListResource = await aptos.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::todolist::TodoList`,
      });
      setAccountHasList(true);
      const tableHandle = (todoListResource as any).tasks.handle;
      const taskCounter = (todoListResource as any).task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::todolist::Task`,
          key: `${counter}`,
        };
        const task = await aptos.getTableItem<Task>({ handle: tableHandle, data: tableItem });
        tasks.push(task);
        counter++;
      }
      setTasks(tasks);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };

  const addNewList = async () => {
    if (!account) return [];
    setTransactionInProgress(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::create_list`,
        functionArguments: [],
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onTaskAdded = async () => {
    if (!account) return;
    setTransactionInProgress(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::create_task`,
        functionArguments: [newTask],
      },
    };

    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;

    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      let newTasks = [...tasks];
      newTasks.push(newTaskToPush);
      setTasks(newTasks);
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onCheckboxChange = async (event: CheckboxChangeEvent, taskId: string) => {
    if (!account) return;
    if (!event.target.checked) return;
    setTransactionInProgress(true);
    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::todolist::complete_task`,
        functionArguments: [taskId],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });

      setTasks((prevState) => {
        const newState = prevState.map((obj) => {
          if (obj.task_id === taskId) {
            return { ...obj, completed: true };
          }
          return obj;
        });
        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const onAIPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAIPrompt(event.target.value);
  };

  const onAIprompt = async () => {
    if (!aiPrompt) return;

    try {
        const genAI = new GoogleGenerativeAI("AIzaSyBNO9xOo6VkKBf0XfV9MiUSXgyUWeU_juI");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // const result = await model.generateContent(aiPrompt);
      const result = await model.generateContent("You are a todo-list recommendation agen, give a todo list with numeric indexing for the given prompt  : "+aiPrompt);

        const aiGeneratedMarkdown = result.response.text(); // Get the markdown response from AI

        // Remove basic markdown characters (bold, italic, etc.)
        const aiGeneratedText = aiGeneratedMarkdown
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
            .replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
            .replace(/[-_*~`]/g, '');        // Remove other markdown symbols like lists, code blocks

        // Assuming the response is a list of tasks separated by new lines or commas, split and store it in state
        const generatedTasks: string[] = aiGeneratedText
            .split('\n')
            .map((task: string) => task.trim()) // Explicitly declare 'task' as string
            .filter((task: string) => task.length > 0); // Ensure the task is not empty

        setAITasks(generatedTasks); // Store AI-generated tasks
    } catch (error: any) {
        console.log("AI error:", error);
    }
};




  useEffect(() => {
    fetchList();
  }, [account?.address]);

  return (
    <>
      <Layout>
        <Row align="middle" style={{ paddingTop: "25px", paddingBottom: "25px" }}>
          <Col span={10} offset={2}>
            <h1 style={{ fontFamily: 'monospace', textDecoration: 'underline' }}>AI Todolist</h1>
          </Col>
          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
        {!accountHasList ? (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Button
                disabled={!account}
                block
                onClick={addNewList}
                type="primary"
                style={{ height: "40px", backgroundColor: "#3f67ff" }}
              >
                Add new list
              </Button>
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
            <Col span={8} offset={8}>
              <Input.Group compact>
                <Input
                  onChange={onWriteTask}
                  style={{ width: "calc(100% - 60px)" }}
                  placeholder="Add a Task"
                  size="large"
                  value={newTask}
                />
                <Button onClick={onTaskAdded} type="primary" style={{ height: "40px", backgroundColor: "#3f67ff" }}>
                  Add
                </Button>
              </Input.Group>
            </Col>
            <Col span={8} offset={8}>
              {tasks && (
                <List
                  size="small"
                  bordered
                  dataSource={tasks}
                  renderItem={(task: any) => (
                    <List.Item
                      actions={[
                        <div>
                          {task.completed ? <Checkbox defaultChecked={true} disabled /> : <Checkbox onChange={(event) => onCheckboxChange(event, task.task_id)} />}
                        </div>,
                      ]}
                    >
                      <List.Item.Meta
                        title={task.content}
                        description={
                          <a
                            href={`https://explorer.aptoslabs.com/account/${task.address}/`}
                            target="_blank"
                            rel="noreferrer"
                          >{`${task.address.slice(0, 6)}...${task.address.slice(-5)}`}</a>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col>
          </Row>
        )}
      </Spin>

      {/* Section for AI to-do list generation */}
      <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
        <Col span={8} offset={8}>
          <h2 style={{ textAlign: 'center' }}>AI Generated TODO</h2> {/* Added Heading */}
          <Input.Group compact style={{ display: 'flex', justifyContent: 'center' }}>
            <Input
              onChange={onAIPromptChange}
              style={{ width: "calc(100% - 60px)" }}
              placeholder="What do you want to achieve today?!"
              size="large"
              value={aiPrompt}
            />
            <Button onClick={onAIprompt} type="primary" style={{ height: "40px", backgroundColor: "#3f67ff", marginLeft: '10px' }}>
              Generate
            </Button>
          </Input.Group>
        </Col>
      </Row>

      {/* Display the AI-generated tasks */}
      {aiTasks.length > 0 && (
        <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
          <Col span={8} offset={8}>
            <List
              size="small"
              bordered
              dataSource={aiTasks}
              renderItem={(task: string) => (
                <List.Item>
                  <List.Item.Meta title={task} />
                </List.Item>
              )}
            />
          </Col>
        </Row>
      )}
    </>
  );
}

export default App;
