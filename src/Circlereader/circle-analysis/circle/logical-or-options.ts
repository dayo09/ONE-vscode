/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class LogicalOrOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): LogicalOrOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsLogicalOrOptions(bb: flatbuffers.ByteBuffer, obj?: LogicalOrOptions):
      LogicalOrOptions {
    return (obj || new LogicalOrOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsLogicalOrOptions(bb: flatbuffers.ByteBuffer, obj?: LogicalOrOptions):
      LogicalOrOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new LogicalOrOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static startLogicalOrOptions(builder: flatbuffers.Builder) {
    builder.startObject(0);
  }

  static endLogicalOrOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createLogicalOrOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    LogicalOrOptions.startLogicalOrOptions(builder);
    return LogicalOrOptions.endLogicalOrOptions(builder);
  }
}
