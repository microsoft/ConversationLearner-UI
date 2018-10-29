/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import HelpLink from '../HelpLink'
import { TipType } from './ToolTips'

const renderOnlyText =
    `cl.AddCallback({
        name: "Multiply",
        render: async (logicResult: any, memoryManager: ReadOnlyClientMemoryManager, num1string: string, num2string: string) => {
            // Convert input to integers
            var num1int = parseInt(num1string);
            var num2int = parseInt(num2string);
    
            // Compute product
            var product = num1int * num2int;
    
            // Display result
            return \`\${num1string} * \${num2string} = \${product}\`\
        }
    })`;

const renderOnlyCard =
    `cl.AddCallback({
        name: "RandomGreeting",
        render: async (logicResult: any, memoryManager: ReadOnlyClientMemoryManager, ...args: string[]) => {
            var randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
            const message = BB.MessageFactory.attachment(BB.CardFactory.thumbnailCard(randomGreeting, "Here's a neat photo", ["https://picsum.photos/100/?random"]))
            return message
        }
    })`;

const logicOnly =
    `cl.AddCallback({
        name: "ClearEntities",
        logic: async (memoryManager: ClientMemoryManager) => {
            // Clear "number" entity
            memoryManager.ForgetEntity("number");
        }
    })`;

const apiCorrect =
    `cl.AddCallback({
        name: "RandomMessage-Await-CORRECT",
        logic: async (memoryManager : ClientMemoryManager) => {
            var options = { method: 'GET', uri: 'https://jsonplaceholder.typicode.com/posts/1', json: true }
    
            // CORRECT
            // RememberEntity called before APICallback has returned
            let response = await requestpromise(options)
            memoryManager.RememberEntity("RandomMessage", response.body);
        },
        render: async (logicResult: any, memoryManager: ReadOnlyClientMemoryManager, ...args: string[]) => {
            return logicResult.body
        }
    })`;

const apiWrong =
    `cl.AddCallback({
        name: "RandomMessage-Callback-WRONG",
        logic: async (memoryManager : ClientMemoryManager) => {
            var options = { method: 'GET', uri: 'https://jsonplaceholder.typicode.com/posts/1', json: true }
    
            // !!WRONG!!
            // RememberEntity call will happen after the APICallback has returned
            request(options, (error:any, response:any, body:any) => {
                memoryManager.RememberEntity("RandomMessage", response.body);   // BAD
            })
        },
        render: async (logicResult: any, memoryManager: ReadOnlyClientMemoryManager, ...args: string[]) => {
            return logicResult
        }
    })`;

    const resultAsEntity =
    `cl.AddCallback({
        name: "ResultAsEntity",
        logic: async (memoryManager : ClientMemoryManager) => {
            var options = { method: 'GET', uri: 'https://jsonplaceholder.typicode.com/posts/1', json: true }
            let response = await requestpromise(options)
            memoryManager.RememberEntity("RandomMessage", response.body);
        },
        render: async (logicResult: any, memoryManager: ReadOnlyClientMemoryManager, ...args: string[]) => {
            let value = memoryManager.EntityValue("RandomMessage")
            return value || ""
        }
    })`;

    const resultPassed =
    `cl.AddCallback({
        name: "ResultAsLogicResult",
        logic: async (memoryManager : ClientMemoryManager) => {
            var options = { method: 'GET', uri: 'https://jsonplaceholder.typicode.com/posts/1', json: true }
            let response = await requestpromise(options)
            memoryManager.RememberEntity("RandomMessage", response.body);
        },
        render: async (logicResult: any, memoryManager: ReadOnlyClientMemoryManager, ...args: string[]) => {
            return logicResult.body
        }
    })`;
    
export function renderAPIPage1(): JSX.Element {
    return (
        <div>
            <div>API Callback can be used to impliment business logic in your Bot</div>
            <div><br /><b>API callbacks are divided into two parts:</b></div>
            <ol>
            <li>A 'logic' callback in which Entity values can be set and external APIs can be called</li>
            <li>A 'render' callback which generates Bot output, and can only read Entity values</li>
            </ol>
            <ul>
            <li>API callback can contain a 'logic' callback, a 'render' callback or both</li>
            <li>When displaying an existing Dialog, in the CL editor, only the 'render' callback will be called using saved values from the 'logic' callback.</li>
            <li>When editing an existing Dialog, the 'logic' callback will be invoked</li>
            </ul>
            <b>Example that has only a 'render' callback that takes two arguments and displays text to user</b>
            <pre>{renderOnlyText}</pre>
            <b>Example that has only a 'render' callback that displays a card to the user</b>
            <pre>{renderOnlyCard}</pre>
            <b>Example that only has 'logic' callback</b>
            <pre>{logicOnly}</pre>
            <div><br /><HelpLink label="Data Passing: 'logic' -> 'render'" tipType={TipType.ACTION_API2} /></div>
            <div><HelpLink label="Making external API calls" tipType={TipType.ACTION_API3} /></div>
        </div>
    )
}

export function renderAPIPage2(): JSX.Element {
    return (
        <div>
            <div><b>Data Passing: 'logic' -> 'render'</b></div>
            <div>Data can be passed from the 'logic' callback to the 'render' callback in one of two ways</div>
            <ol>
                <li>Passing Data in Entity
                    <div>If you want to preserve the data for later, you can store it in an entity in the 'logic' callback, and then refer to that Entity value in the 'render' callback</div>
                </li>
                <li>Passing Data in "logicResult"
                    <div>If the data is only temporary and being used just for rendering, you can pass if from the 'logic' callback to the render callback directly by using the "logicResult" parameter</div>
                </li>
            </ol>
            <b>Example using Entity </b>
            <pre>{resultAsEntity}</pre>
            <b>Example using logicResult</b>
            <pre>{resultPassed}</pre>
            <div><br /><HelpLink label="Making external API calls" tipType={TipType.ACTION_API3} /></div>
            <div><HelpLink label="API Overview" tipType={TipType.ACTION_API1} /></div>
        </div>
    )
}

export function renderAPIPage3(): JSX.Element {
    return (
        <div>
            <div><b>Making external API calls</b></div>
            <div><br/>CL expects the 'logic' callbacks to await any asynchronous results<br/></div>
            <b>CORRECT way to do a request</b>
            <pre>{apiCorrect}</pre>
            <b>!!WRONG!! way to do an request</b>
            <pre>{apiWrong}</pre>
            <div><br /><HelpLink label="Data Passing: 'logic' -> 'render'" tipType={TipType.ACTION_API2} /></div>
            <div><HelpLink label="API Overview" tipType={TipType.ACTION_API2} /></div>
        </div>
    )
}