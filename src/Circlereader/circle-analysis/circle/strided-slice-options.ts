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

export class StridedSliceOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): StridedSliceOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsStridedSliceOptions(bb: flatbuffers.ByteBuffer, obj?: StridedSliceOptions):
      StridedSliceOptions {
    return (obj || new StridedSliceOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsStridedSliceOptions(
      bb: flatbuffers.ByteBuffer, obj?: StridedSliceOptions): StridedSliceOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new StridedSliceOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  beginMask(): number {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  endMask(): number {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  ellipsisMask(): number {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  newAxisMask(): number {
    const offset = this.bb!.__offset(this.bb_pos, 10);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  shrinkAxisMask(): number {
    const offset = this.bb!.__offset(this.bb_pos, 12);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  static startStridedSliceOptions(builder: flatbuffers.Builder) {
    builder.startObject(5);
  }

  static addBeginMask(builder: flatbuffers.Builder, beginMask: number) {
    builder.addFieldInt32(0, beginMask, 0);
  }

  static addEndMask(builder: flatbuffers.Builder, endMask: number) {
    builder.addFieldInt32(1, endMask, 0);
  }

  static addEllipsisMask(builder: flatbuffers.Builder, ellipsisMask: number) {
    builder.addFieldInt32(2, ellipsisMask, 0);
  }

  static addNewAxisMask(builder: flatbuffers.Builder, newAxisMask: number) {
    builder.addFieldInt32(3, newAxisMask, 0);
  }

  static addShrinkAxisMask(builder: flatbuffers.Builder, shrinkAxisMask: number) {
    builder.addFieldInt32(4, shrinkAxisMask, 0);
  }

  static endStridedSliceOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createStridedSliceOptions(
      builder: flatbuffers.Builder, beginMask: number, endMask: number, ellipsisMask: number,
      newAxisMask: number, shrinkAxisMask: number): flatbuffers.Offset {
    StridedSliceOptions.startStridedSliceOptions(builder);
    StridedSliceOptions.addBeginMask(builder, beginMask);
    StridedSliceOptions.addEndMask(builder, endMask);
    StridedSliceOptions.addEllipsisMask(builder, ellipsisMask);
    StridedSliceOptions.addNewAxisMask(builder, newAxisMask);
    StridedSliceOptions.addShrinkAxisMask(builder, shrinkAxisMask);
    return StridedSliceOptions.endStridedSliceOptions(builder);
  }
}
