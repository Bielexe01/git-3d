export function Studio({ wide = false }: { wide?: boolean }) {
  return (
    <>
      <color attach="background" args={["#0c0c0f"]} />
      <ambientLight intensity={0.38} />
      <spotLight
        position={wide ? [3.2, 6.4, 3.4] : [1.2, 2.8, 2.6]}
        angle={0.62}
        penumbra={0.7}
        intensity={wide ? 80 : 46}
        color="#fff6ea"
      />
      <directionalLight position={[-3.2, 2.2, 2.4]} intensity={wide ? 2.4 : 1.8} color="#c5d2e4" />
      <directionalLight position={[0.4, 1.2, 4]} intensity={1.3} color="#ffe8cc" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
        <circleGeometry args={[wide ? 8.5 : 3.4, 48]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.95} metalness={0.02} />
      </mesh>
      {wide ? (
        <>
          <mesh position={[0.2, 1.8, -3.1]}>
            <planeGeometry args={[16, 5.2]} />
            <meshStandardMaterial color="#070708" roughness={1} />
          </mesh>
          <mesh position={[-3.8, 1.8, -0.15]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[8, 5.2]} />
            <meshStandardMaterial color="#09090b" roughness={1} />
          </mesh>
        </>
      ) : null}
    </>
  );
}
