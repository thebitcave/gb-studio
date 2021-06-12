import ScriptBuilder from "../../../src/lib/compiler/scriptBuilder";
import { ScriptEvent } from "../../../src/store/features/entities/entitiesTypes";

test("Should be able to set active actor to player", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [
        {
          id: "actor1",
        },
      ],
      triggers: [],
    },
    entity: {
      id: "actor1",
    },
  });
  sb.actorSetActive("player");
  expect(output).toEqual([
    "        ; Actor Set Active",
    "        VM_SET_CONST            ACTOR, 0",
    "",
  ]);
});

test("Should be able to set active actor to actor by id", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [
        {
          id: "actor1",
        },
        {
          id: "actor2",
        },
      ],
      triggers: [],
    },
  });
  sb.actorSetActive("actor2");
  expect(output).toEqual([
    "        ; Actor Set Active",
    "        VM_SET_CONST            ACTOR, 2",
    "",
  ]);
});

test("Should be able to move actor to new location", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [],
      triggers: [],
    },
  });
  sb.actorMoveTo(5, 6, true, "horizontal");
  expect(output).toEqual([
    "        ; Actor Move To",
    "        VM_SET_CONST            ^/(ACTOR + 1)/, 640",
    "        VM_SET_CONST            ^/(ACTOR + 2)/, 768",
    "        VM_SET_CONST            ^/(ACTOR + 3)/, ^/(.ACTOR_ATTR_CHECK_COLL | .ACTOR_ATTR_H_FIRST)/",
    "        VM_ACTOR_MOVE_TO        ACTOR",
    "",
  ]);
});

test("Should be able to wait for N frames to pass", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [],
      triggers: [],
    },
  });
  sb.wait(20);
  expect(output).toEqual([
    "        ; Wait N Frames",
    "        VM_PUSH_CONST           20",
    "        VM_INVOKE               b_wait_frames, _wait_frames, 1, .ARG0",
    "",
  ]);
});

test("Should be able to generate script string", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [
        {
          id: "actor1",
        },
        {
          id: "actor2",
        },
      ],
      triggers: [],
    },
  });
  sb.actorSetActive("actor2");
  sb.actorMoveTo(5, 6, true, "horizontal");
  expect(sb.toScriptString("MY_SCRIPT", false)).toEqual(
    `.include "vm.i"
.include "data/game_globals.i"

.area _CODE_255

ACTOR = -4

___bank_MY_SCRIPT = 255
.globl ___bank_MY_SCRIPT

_MY_SCRIPT::
        ; Local Actor
        VM_PUSH_CONST           0
        VM_PUSH_CONST           0
        VM_PUSH_CONST           0
        VM_PUSH_CONST           0

        ; Actor Set Active
        VM_SET_CONST            ACTOR, 2

        ; Actor Move To
        VM_SET_CONST            ^/(ACTOR + 1)/, 640
        VM_SET_CONST            ^/(ACTOR + 2)/, 768
        VM_SET_CONST            ^/(ACTOR + 3)/, ^/(.ACTOR_ATTR_CHECK_COLL | .ACTOR_ATTR_H_FIRST)/
        VM_ACTOR_MOVE_TO        ACTOR

`
  );
});

test("Should be able to open dialogue boxes", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [],
      triggers: [],
    },
  });
  sb.textDialogue("Hello World");
  sb.scriptEnd();

  expect(sb.toScriptString("MY_SCRIPT", false)).toEqual(
    `.include "vm.i"
.include "data/game_globals.i"

.area _CODE_255

___bank_MY_SCRIPT = 255
.globl ___bank_MY_SCRIPT

_MY_SCRIPT::
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "Hello World"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

        ; Stop Script
        VM_STOP
`
  );
});

test("Should be able to conditionally execute if variable is true with event array paths", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [],
      triggers: [],
    },
    // variables: ["0", "1"],
    compileEvents: (self: ScriptBuilder, events: ScriptEvent[]) => {
      if (events[0].id === "event1") {
        output.push("        VM_DEBUG                0");
        output.push('        .asciz "True Path"');
      } else {
        output.push("        VM_DEBUG                0");
        output.push('        .asciz "False Path"');
      }
    },
  });
  sb.ifVariableTrue(
    "1",
    [
      {
        id: "event1",
        command: "DUMMY1",
        args: {},
      },
    ],
    [
      {
        id: "event2",
        command: "DUMMY2",
        args: {},
      },
    ]
  );
  expect(sb.toScriptString("MY_SCRIPT", false)).toEqual(
    `.include "vm.i"
.include "data/game_globals.i"

.area _CODE_255

___bank_MY_SCRIPT = 255
.globl ___bank_MY_SCRIPT

_MY_SCRIPT::
        ; If Variable True
        VM_IF_CONST .GT         VAR_VARIABLE_1, 0, 1$, 0
        VM_DEBUG                0
        .asciz "False Path"
        VM_JUMP                 2$
1$:
        VM_DEBUG                0
        .asciz "True Path"
2$:

`
  );
});

test("Should be able to conditionally execute if variable is true with function paths", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [
        {
          id: "actor1",
        },
        {
          id: "actor2",
        },
      ],
      triggers: [],
    },
    // variables: ["0", "1"],
    compileEvents: (self: ScriptBuilder, events: ScriptEvent[]) => {
      if (events[0].id === "event1") {
        output.push("        VM_DEBUG        0");
        output.push('        .asciz "True Path"');
      } else {
        output.push("        VM_DEBUG        0");
        output.push('        .asciz "False Path"');
      }
    },
  });
  sb.ifVariableTrue(
    "0",
    () => sb.textDialogue("Hello World"),
    () => sb.textDialogue("Goodbye World")
  );
  sb.scriptEnd();

  expect(sb.toScriptString("MY_SCRIPT", false)).toEqual(
    `.include "vm.i"
.include "data/game_globals.i"

.area _CODE_255

___bank_MY_SCRIPT = 255
.globl ___bank_MY_SCRIPT

_MY_SCRIPT::
        ; If Variable True
        VM_IF_CONST .GT         VAR_VARIABLE_0, 0, 1$, 0
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "Goodbye World"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

        VM_JUMP                 2$
1$:
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "Hello World"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

2$:

        ; Stop Script
        VM_STOP
`
  );
});

test("Should be able to conditionally execute if variable is true with nested function paths", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [
        {
          id: "actor1",
        },
        {
          id: "actor2",
        },
        {
          id: "actor3",
        },
        {
          id: "actor4",
        },
      ],
      triggers: [],
    },
    // variables: ["0", "1", "2"],
  });

  sb.ifVariableTrue(
    "0",
    // 0 == True
    () =>
      sb.ifVariableTrue(
        "1",
        () => sb.textDialogue("0=TRUE 1=TRUE"), // 1 == True
        () => sb.textDialogue("0=TRUE 1=FALSE") // 1 == False
      ),
    // 0 == False
    () =>
      sb.ifVariableTrue(
        "2",
        () => sb.textDialogue("0=FALSE 2=TRUE"), // 2 == True
        () => sb.textDialogue("0=FALSE 2=FALSE") // 2 == False
      )
  );
  sb.scriptEnd();

  expect(sb.toScriptString("MY_SCRIPT", false)).toEqual(
    `.include "vm.i"
.include "data/game_globals.i"

.area _CODE_255

___bank_MY_SCRIPT = 255
.globl ___bank_MY_SCRIPT

_MY_SCRIPT::
        ; If Variable True
        VM_IF_CONST .GT         VAR_VARIABLE_0, 0, 1$, 0
        ; If Variable True
        VM_IF_CONST .GT         VAR_VARIABLE_2, 0, 3$, 0
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "0=FALSE 2=FALSE"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

        VM_JUMP                 4$
3$:
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "0=FALSE 2=TRUE"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

4$:

        VM_JUMP                 2$
1$:
        ; If Variable True
        VM_IF_CONST .GT         VAR_VARIABLE_1, 0, 5$, 0
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "0=TRUE 1=FALSE"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

        VM_JUMP                 6$
5$:
        ; Text Dialogue
        VM_LOAD_TEXT            0
        .asciz "0=TRUE 1=TRUE"
        VM_OVERLAY_CLEAR        0, 0, 20, 4, .UI_COLOR_WHITE, ^/(.UI_AUTO_SCROLL | .UI_DRAW_FRAME)/
        VM_OVERLAY_MOVE_TO      0, 14, .OVERLAY_TEXT_IN_SPEED
        VM_DISPLAY_TEXT
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT | .UI_WAIT_BTN_A)/
        VM_OVERLAY_MOVE_TO      0, 18, .OVERLAY_TEXT_OUT_SPEED
        VM_OVERLAY_WAIT         .UI_MODAL, ^/(.UI_WAIT_WINDOW | .UI_WAIT_TEXT)/

6$:

2$:

        ; Stop Script
        VM_STOP
`
  );
});

test("Should be able to define labels and jump", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [],
      triggers: [],
    },
  });
  sb.labelDefine("mylabel");
  sb.labelGoto("mylabel");

  expect(sb.toScriptString("MY_SCRIPT", false)).toEqual(
    `.include "vm.i"
.include "data/game_globals.i"

.area _CODE_255

___bank_MY_SCRIPT = 255
.globl ___bank_MY_SCRIPT

_MY_SCRIPT::
mylabel$:
        VM_JUMP                 mylabel$
`
  );
});

test("Should throw if jump to label is not stack neutral", () => {
  const output: string[] = [];
  const sb = new ScriptBuilder(output, {
    scene: {
      id: "scene1",
      actors: [
        {
          id: "actor1",
        },
      ],
      triggers: [],
    },
    entity: {
      id: "actor1",
    },
  });
  sb._stackPush(5);
  sb._label("abc");
  sb._stackPop(1);
  expect(() => sb._jump("abc")).toThrow();
});