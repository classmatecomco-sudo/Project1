export const metadata = {
  title: '조별과제 공정 분배 가이드 - 나눠줌',
  description: '조별과제나 팀 프로젝트에서 공정하게 업무를 분배하는 방법과 실전 팁을 알아보세요. 갈등 없이 효율적으로 협업하는 비결을 공개합니다.',
  keywords: '조별과제, 공정 분배, 팀워크, 협업, 숙제 분배, 과제 관리',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <article className="mx-auto max-w-3xl">
        <div className="mb-6">
          <a
            href="/"
            className="mb-4 inline-block text-indigo-600 hover:text-indigo-700"
          >
            ← 홈으로
          </a>
          <h1 className="mb-4 text-4xl font-bold text-gray-800">
            조별과제 공정 분배 가이드: 갈등 없이 숙제 나누는 완벽한 방법
          </h1>
          <p className="text-xl text-gray-600">
            조별과제나 팀 프로젝트에서 공정하게 업무를 분배하는 방법과 실전 팁을 알아보세요. 갈등 없이 효율적으로 협업하는 비결을 공개합니다.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-800">
              왜 공정한 분배가 중요한가?
            </h2>
            <p className="mb-4 text-gray-700 leading-7">
              조별과제나 팀 프로젝트를 할 때 가장 어려운 부분 중 하나는 바로 업무 분배입니다. 누가 어떤 일을 맡을지 결정하는 과정에서 불공정하다는 불만이 생기거나, 일부 팀원에게만 과도한 업무가 몰리는 경우가 종종 발생합니다. 이번 글에서는 공정하고 효율적으로 과제를 분배하는 방법을 자세히 알아보겠습니다.
            </p>
            <p className="mb-4 text-gray-700 leading-7">
              공정한 업무 분배는 단순히 일을 나누는 것을 넘어서 팀의 신뢰와 협업의 기반이 됩니다. 불공정한 분배는 팀원 간의 갈등을 유발하고, 프로젝트의 질을 떨어뜨리며, 장기적으로는 팀워크를 해치는 결과를 낳습니다. 반면 공정한 분배는 모든 팀원이 자신의 역할에 만족하고, 책임감을 가지고 임무를 수행하게 만들어 최종 결과물의 품질을 높입니다.
            </p>

            <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-800">
              효과적인 분배 전략
            </h2>

            <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-800">
              1. 업무의 성격과 난이도 파악하기
            </h3>
            <p className="mb-4 text-gray-700 leading-7">
              먼저 해야 할 일은 각 업무의 특성을 정확히 파악하는 것입니다. 모든 업무가 동일한 난이도와 시간이 필요한 것은 아닙니다. 리서치, 자료 정리, 발표 준비, 보고서 작성 등 각 업무의 특성과 예상 소요 시간을 명확히 정리해야 합니다. 이를 통해 단순히 업무의 개수만 나누는 것이 아니라, 실제 작업량을 고려한 균형잡힌 분배가 가능해집니다.
            </p>

            <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-800">
              2. 팀원의 강점과 선호도 고려하기
            </h3>
            <p className="mb-4 text-gray-700 leading-7">
              각 팀원은 서로 다른 강점과 관심사를 가지고 있습니다. 어떤 사람은 자료 조사에 능하고, 어떤 사람은 글쓰기에 뛰어나며, 또 다른 사람은 발표나 프레젠테이션에 강점이 있을 수 있습니다. 팀원들의 강점을 파악하고 이를 업무 분배에 반영하면, 각자가 자신 있는 분야에서 최선의 성과를 낼 수 있습니다. 또한 각자의 선호도를 존중하는 것도 중요합니다. 물론 항상 원하는 일만 할 수는 없지만, 가능한 범위에서 선호도를 고려하면 팀원들의 동기부여와 만족도가 높아집니다.
            </p>

            <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-800">
              3. 투명한 의사결정 과정
            </h3>
            <p className="mb-4 text-gray-700 leading-7">
              가장 중요한 것은 분배 과정 자체가 투명하고 공개적이어야 한다는 점입니다. 비밀리에 결정하거나 소수의 의견만 반영하면 나중에 불만이 생기기 쉽습니다. 모든 팀원이 참여하는 회의를 통해 함께 논의하고 결정하는 것이 좋습니다. 만약 의견이 분분하다면, 무작위 추첨이나 공정한 도구를 활용하는 것도 좋은 방법입니다. 이렇게 하면 결과에 대한 불만을 최소화할 수 있습니다.
            </p>

            <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-800">
              4. 정기적인 점검과 조정
            </h3>
            <p className="mb-4 text-gray-700 leading-7">
              초기에 분배한 업무가 실제로는 예상과 다를 수 있습니다. 어떤 업무는 생각보다 쉬웠고, 어떤 업무는 예상보다 어려웠을 수 있습니다. 따라서 정기적으로 진행 상황을 점검하고, 필요하다면 중간에 조정하는 것이 중요합니다. 한 사람에게만 과도한 부담이 몰리지 않도록 팀 전체가 서로를 배려하고 도와주는 문화를 만드는 것이 장기적으로 가장 효과적입니다.
            </p>

            <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-800">
              실전 팁과 주의사항
            </h2>
            <p className="mb-4 text-gray-700 leading-7">
              공정한 분배를 위해서는 객관적인 기준을 마련하는 것이 도움이 됩니다. 예를 들어, 각 업무에 예상 소요 시간을 표시하고, 이를 합산하여 팀원 수로 나누어 각자에게 비슷한 양의 작업이 할당되도록 할 수 있습니다. 또한 업무의 우선순위를 정하고, 중요한 업무는 여러 사람이 함께 담당하거나, 경험이 많은 팀원과 신입 팀원을 함께 배치하는 것도 좋은 방법입니다.
            </p>
            <p className="mb-4 text-gray-700 leading-7">
              마지막으로 기억해야 할 것은 완벽한 분배는 불가능하다는 점입니다. 완전히 동일한 양과 난이도의 업무를 분배하는 것은 현실적으로 어렵습니다. 하지만 투명한 과정과 상호 존중을 바탕으로 한 분배라면, 팀원들이 결과를 받아들이고 협력할 가능성이 높아집니다.
            </p>

            <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-800">
              결론
            </h2>
            <p className="mb-4 text-gray-700 leading-7">
              공정한 업무 분배는 조별과제와 팀 프로젝트의 성공을 좌우하는 핵심 요소입니다. 업무의 특성을 파악하고, 팀원의 강점을 활용하며, 투명한 의사결정 과정을 거치고, 필요시 조정하는 것이 효과적인 분배를 위한 핵심 원칙입니다. 이러한 원칙을 따르면 갈등 없이 효율적으로 협업할 수 있으며, 모든 팀원이 만족하는 결과를 만들어낼 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600"
          >
            숙제 분배기 사용하기
          </a>
        </div>
      </article>
    </div>
  )
}
