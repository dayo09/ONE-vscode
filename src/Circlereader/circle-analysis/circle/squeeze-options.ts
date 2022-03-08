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

export class SqueezeOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): SqueezeOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsSqueezeOptions(bb: flatbuffers.ByteBuffer, obj?: SqueezeOptions): SqueezeOptions {
    return (obj || new SqueezeOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsSqueezeOptions(bb: flatbuffers.ByteBuffer, obj?: SqueezeOptions):
      SqueezeOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new SqueezeOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  squeezeDims(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  squeezeDimsLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  squeezeDimsArray(): Int32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? new Int32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  static startSqueezeOptions(builder: flatbuffers.Builder) {
    builder.startObject(1);
  }

  static addSqueezeDims(builder: flatbuffers.Builder, squeezeDimsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(0, squeezeDimsOffset, 0);
  }

  static createSqueezeDimsVector(builder: flatbuffers.Builder, data: number[]|Int32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createSqueezeDimsVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createSqueezeDimsVector(
      builder: flatbuffers.Builder, data: number[]|Int32Array|Uint8Array): flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]!);
    }
    return builder.endVector();
  }

  static startSqueezeDimsVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static endSqueezeOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createSqueezeOptions(builder: flatbuffers.Builder, squeezeDimsOffset: flatbuffers.Offset):
      flatbuffers.Offset {
    SqueezeOptions.startSqueezeOptions(builder);
    SqueezeOptions.addSqueezeDims(builder, squeezeDimsOffset);
    return SqueezeOptions.endSqueezeOptions(builder);
  }
}
