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

export class PadV2Options {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): PadV2Options {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsPadV2Options(bb: flatbuffers.ByteBuffer, obj?: PadV2Options): PadV2Options {
    return (obj || new PadV2Options()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsPadV2Options(bb: flatbuffers.ByteBuffer, obj?: PadV2Options):
      PadV2Options {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new PadV2Options()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static startPadV2Options(builder: flatbuffers.Builder) {
    builder.startObject(0);
  }

  static endPadV2Options(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createPadV2Options(builder: flatbuffers.Builder): flatbuffers.Offset {
    PadV2Options.startPadV2Options(builder);
    return PadV2Options.endPadV2Options(builder);
  }
}
