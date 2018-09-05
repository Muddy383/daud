// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Game.Engine.Networking.FlatBuffers
{

using global::System;
using global::Google.FlatBuffers;

public struct NetBody : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static NetBody GetRootAsNetBody(ByteBuffer _bb) { return GetRootAsNetBody(_bb, new NetBody()); }
  public static NetBody GetRootAsNetBody(ByteBuffer _bb, NetBody obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p.bb_pos = _i; __p.bb = _bb; }
  public NetBody __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public int Id { get { int o = __p.__offset(4); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }
  public long DefinitionTime { get { int o = __p.__offset(6); return o != 0 ? __p.bb.GetLong(o + __p.bb_pos) : (long)0; } }
  public int Size { get { int o = __p.__offset(8); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }
  public string Sprite { get { int o = __p.__offset(10); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
  public ArraySegment<byte>? GetSpriteBytes() { return __p.__vector_as_arraysegment(10); }
  public string Color { get { int o = __p.__offset(12); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
  public ArraySegment<byte>? GetColorBytes() { return __p.__vector_as_arraysegment(12); }
  public string Caption { get { int o = __p.__offset(14); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
  public ArraySegment<byte>? GetCaptionBytes() { return __p.__vector_as_arraysegment(14); }
  public float OriginalAngle { get { int o = __p.__offset(16); return o != 0 ? __p.bb.GetFloat(o + __p.bb_pos) : (float)0.0f; } }
  public float AngularVelocity { get { int o = __p.__offset(18); return o != 0 ? __p.bb.GetFloat(o + __p.bb_pos) : (float)0.0f; } }
  public Vec2? Momentum { get { int o = __p.__offset(20); return o != 0 ? (Vec2?)(new Vec2()).__assign(o + __p.bb_pos, __p.bb) : null; } }
  public Vec2? OriginalPosition { get { int o = __p.__offset(22); return o != 0 ? (Vec2?)(new Vec2()).__assign(o + __p.bb_pos, __p.bb) : null; } }

  public static void StartNetBody(FlatBufferBuilder builder) { builder.StartObject(10); }
  public static void AddId(FlatBufferBuilder builder, int id) { builder.AddInt(0, id, 0); }
  public static void AddDefinitionTime(FlatBufferBuilder builder, long definitionTime) { builder.AddLong(1, definitionTime, 0); }
  public static void AddSize(FlatBufferBuilder builder, int size) { builder.AddInt(2, size, 0); }
  public static void AddSprite(FlatBufferBuilder builder, StringOffset spriteOffset) { builder.AddOffset(3, spriteOffset.Value, 0); }
  public static void AddColor(FlatBufferBuilder builder, StringOffset colorOffset) { builder.AddOffset(4, colorOffset.Value, 0); }
  public static void AddCaption(FlatBufferBuilder builder, StringOffset captionOffset) { builder.AddOffset(5, captionOffset.Value, 0); }
  public static void AddOriginalAngle(FlatBufferBuilder builder, float originalAngle) { builder.AddFloat(6, originalAngle, 0.0f); }
  public static void AddAngularVelocity(FlatBufferBuilder builder, float angularVelocity) { builder.AddFloat(7, angularVelocity, 0.0f); }
  public static void AddMomentum(FlatBufferBuilder builder, Offset<Vec2> momentumOffset) { builder.AddStruct(8, momentumOffset.Value, 0); }
  public static void AddOriginalPosition(FlatBufferBuilder builder, Offset<Vec2> originalPositionOffset) { builder.AddStruct(9, originalPositionOffset.Value, 0); }
  public static Offset<NetBody> EndNetBody(FlatBufferBuilder builder) {
    int o = builder.EndObject();
    return new Offset<NetBody>(o);
  }
};


}
