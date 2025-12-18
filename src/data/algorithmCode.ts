/**
 * Java algorithm code for Course Schedule problem
 * Line numbers are 1-indexed for display
 */
export const algorithmCode = `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // 拓扑排序
        // 构造邻接表以及统计入度等等
        Map<Integer, List<Integer>> nextMap = new HashMap<>();
        int[] ingressCount = new int[numCourses];
        Arrays.fill(ingressCount, 0);
        for (int[] p : prerequisites) {
            int from = p[0];
            int to = p[1];
            ingressCount[to]++;
            List<Integer> nextList = nextMap.getOrDefault(from, new ArrayList<>());
            nextList.add(to);
            nextMap.put(from, nextList);
        }
        // 开始拓扑排序
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < ingressCount.length; i++) {
            if (ingressCount[i] == 0) {
                queue.offer(i);
            }
        }
        int learnCount = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            List<Integer> nextList = nextMap.get(course);
            if (nextList != null) {
                for (int toCourse : nextList) {
                    ingressCount[toCourse]--;
                    if (ingressCount[toCourse] == 0) {
                        queue.offer(toCourse);
                    }
                }
            }
            learnCount++;
        }
        return learnCount == numCourses;
    }
}`;

/**
 * Code lines array for easier access
 */
export const codeLines = algorithmCode.split('\n');

/**
 * Total number of lines in the code
 */
export const totalLines = codeLines.length;
