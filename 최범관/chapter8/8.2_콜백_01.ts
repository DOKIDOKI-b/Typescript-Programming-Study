// 비동기 JS 프로그램의 기본 단위는 콜백이다.
// 다른 함수에 전달되는 함수가 콜백

// 비동기 함수가 호출하는 콜백 함수는 일반적인 함수이기 때문에 타입스크립트로 비동기임을 알리는 시그니처는 존재하지 않음

// 🔥 콜백지옥
// 비동기 처리 로직을 순차적으로 실행하기 위해 콜백 함수를 계속 중첩하여 사용할 때 발생하는 문제를 콜백 지옥이라고 부른다.
// 코드의 가독성 및 에러 처리 등의 로직이 복잡해진다는 문제가 있다.

// src에 있는 스크립트를 읽어오는 함수
function loadScript1(src: string) {
  const script = document.createElement('script');
  script.src = src;
  document.head.append(script);
}

loadScript1('script.ts');

// 위 loadScript 함수는 비동기 동작을 하는 함수이기 때문에 로드가 완료된 시점에 어떠한 작업을 하고 싶어도 할 수 없다.
// 또 로드하는 것을 기다리지 않기 때문에 불러오는 스크립트 안의 함수나 변수를 사용하기 곤란하다.

// 스크립트의 로딩이 끝나면 실행될 콜백 함수를 인자로 받아 이 문제를 해결할 수 있다.

function loadScript2(
  src: string,
  callback: (script: HTMLScriptElement) => void
) {
  // <script> 태그를 만들고 페이지에 태그를 추가
  // 태그가 페이지에 추가되면 src에 있는 스크립트를 로딩하고 실행
  const script = document.createElement('script');
  script.src = src;

  // 스크립트 로딩이 끝나면 실행될 콜백 함수
  script.onload = () => callback(script);
  document.head.append(script);
}

loadScript2(
  'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.2.0/lodash.js',
  script => {
    alert(`${script.src}가 로드되었습니다.`);
  }
);
// 만약 스크립트가 여러 개 존재하는 경우 이 스크립트를 순차적으로 불러오려면?
// 콜백 함수 내부에 함수를 실행하고, 또 실행하고 실행하고..
// 에러를 처리하기 곤란할 뿐더러 콜백을 처리하는 로직을 알아보기도 어렵다.

// 에러 핸들링
function loadScript3(
  src: string,
  callback: (error: Error | null, script?: HTMLScriptElement) => void
) {
  // <script> 태그를 만들고 페이지에 태그를 추가
  // 태그가 페이지에 추가되면 src에 있는 스크립트를 로딩하고 실행
  const script = document.createElement('script');
  script.src = src;

  // 스크립트 로딩이 끝나면 실행될 콜백 함수
  script.onload = () => callback(null, script);
  script.onerror = () =>
    callback(new Error(`${src}를 불러오는 도중 에러가 발생했습니다.`));

  document.head.append(script);
}

function handleError(error: Error) {}

loadScript3('1.js', function (error, script) {
  if (error) {
    handleError(error);
  } else {
    // ...
    loadScript3('2.js', function (error, script) {
      if (error) {
        handleError(error);
      } else {
        // ...
        loadScript3('3.js', function (error, script) {
          if (error) {
            handleError(error);
          } else {
            // 모든 스크립트가 로딩된 후, 실행 흐름이 이어짐
          }
        });
      }
    });
  }
});

// 여러 개의 비동기 작업을 순차적으로 처리하기 위해서 콜백 함수가 콜백 함수의 꼬리를 무는 형태가 계속되는 것을 콜백 지옥
// 간단한 비동기 작업은 콜백 함수를 통해 처리해도 문제가 되지 않겠지만, 비동기 작업이 여러 개로 늘어나면 금방 복잡해진다.
