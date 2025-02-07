import React, { useState } from 'react';
import { ChevronRight, BookOpen, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Topic, Subtopic, QuizItem } from '../Theory/GettingStarted/dbms';
import createIntroToDBMSSubtopic from '../Theory/GettingStarted/IntroToDBMS';
import createFileSystemVsDBMSSubtopic from '../Theory/GettingStarted/FileSystemVsDBMS';
import createDBMSArchitecturesSubtopic from '../Theory/GettingStarted/DBMSArchitecture';
import createOLAPVsOLTPSubtopic from '../Theory/GettingStarted/OLAPVsOLTP';
import createSchemaArchitectureSubtopic from '../Theory/GettingStarted/SchemaArchitecture';
import createDataIndependenceSubtopic from '../Theory/GettingStarted/DataIndependence';
import createKnowledgeCheckSubtopic from '../Theory/GettingStarted/KnowledgeCheck';
import createCandidateAndSuperKeySubtopic from '../Theory/ConceptOfKeys/CandidateAndSuperKey';
import createPrimaryAndAlternateKeySubtopic from '../Theory/ConceptOfKeys/PrimaryAndAlternateKey';
import createForeignKeySubtopic from '../Theory/ConceptOfKeys/ForeignKeys';
import createAttributeClosureSubtopic from '../Theory/ConceptOfKeys/AttributeClosure';
import createFunctionalDependencySubtopic from '../Theory/ConceptOfKeys/FunctionalDependency';
import createKnowledgeCheckSubtopicKeys from '../Theory/ConceptOfKeys/KnowledgeCheckKeys';
import createERModelSubtopic from '../Theory/ERDiagram/IntroToERModel';
import createTypesOfAttributesSubtopic from '../Theory/ERDiagram/TypesOfAttributes'; 
import createRelationshipInERDiagramSubtopic from '../Theory/ERDiagram/RelationshipInERDiagram';
import createCardinalityRatioAndParticipatingConstraintsSubtopic from '../Theory/ERDiagram/CardinalityRatioAndParticipatingConstraints';
import createMappingRelationshipsSubtopic from '../Theory/ERDiagram/Mapping';
import createSelfReferentialSubtopic from '../Theory/ERDiagram/SelfReferential';
import createWeakEntitySubtopic from '../Theory/ERDiagram/WeakEntity';
import createERModelKnowledgeCheck from '../Theory/ERDiagram/KnowledgeCheckER';
import createNormalizationSubtopic from '../Theory/Normalization/IntroToNormalization';
import createCanonicalCoverSubtopic from '../Theory/Normalization/CanonicalCover';
import createEquivalenceOfFDsSubtopic from '../Theory/Normalization/EquivalenceOfFDs';
import createArmstrongAxiomsSubtopic from '../Theory/Normalization/ArmstrongAxioms';
import createLosslessJoinDecompositionSubtopic from '../Theory/Normalization/LosslessJoinDecomposition';
import createDependencyPreservingDecompositionSubtopic from '../Theory/Normalization/DependencyPreservencyDecomposition';
import createThirdNormalFormSubtopic from '../Theory/Normalization/ThirdNormalForm';
import createSecondNormalFormSubtopic from '../Theory/Normalization/SecondNormalForm';
import createBoyceCoddNormalFormSubtopic from '../Theory/Normalization/BoyceCoddNormalForm';
import createFirstNormalFormSubtopic from '../Theory/Normalization/FirstNormalForm';
import createHowToFindNormalFormSubtopic from '../Theory/Normalization/HowToFindNormalForm';
import createHighestNormalFormSubtopic from '../Theory/Normalization/DecompositionIntoHighestNormalForm';
import createKnowledgeCheckNormalizationSubtopic from '../Theory/Normalization/KnowledgeCheckNormal';
import createRelationalAlgebraSubtopic from '../Theory/RelationalAlgebra/IntroToRelationalAlgebra';
import createSelectionProjectionSubtopic from '../Theory/RelationalAlgebra/SelectionAndProjection';
import createUnionAndIntersectionSubtopic from '../Theory/RelationalAlgebra/UnionIntersection';
import createCartesianProductSubtopic from '../Theory/RelationalAlgebra/CartesianProduct';
import createRenameSetDifferenceOperatorsSubtopic from '../Theory/RelationalAlgebra/RenameSet';
import createJoinsSubtopic from '../Theory/RelationalAlgebra/Joins';
import createQueryTypesSubtopic from '../Theory/RelationalAlgebra/Queries';
import createSetOperationsSubtopic from '../Theory/RelationalAlgebra/QueriesOnSet'; 
import createDivisionOperatorSubtopic from '../Theory/RelationalAlgebra/DivisionOp';
import createJoinTuplesMinMaxSubtopic from '../Theory/RelationalAlgebra/MinMax';
import createTupleRelationalCalculusSubtopic from '../Theory/RelationalAlgebra/TRC';
import createKnowledgeCheckRelationalAlgebraSubtopic from '../Theory/RelationalAlgebra/KnowledgeMCQ';

const topics: Topic[] = [
  createGettingStartedTopic(),
  createConceptOfKeysTopic(),
  createERDiagramTopic(),
  createNormalizationTopic(),
  createRelationalAlgebraTopic(),
];


function createGettingStartedTopic(): Topic {
  return {
    id: 'getting-started',
    title: 'Getting Started with DBMS',
    content: 'Database Management System (DBMS) is software that manages databases. It provides an interface for users and applications to interact with the database. DBMS is a critical part of any system that involves large-scale data management, ensuring data is stored efficiently, securely, and in an organized manner. It allows for easier data retrieval, manipulation, and security while supporting concurrent access by multiple users. Popular DBMS examples include MySQL, PostgreSQL, Oracle, and MongoDB.',
    subtopics: [
      createIntroToDBMSSubtopic(),
      createFileSystemVsDBMSSubtopic(),
      createDBMSArchitecturesSubtopic(),
      createOLAPVsOLTPSubtopic(),
      createSchemaArchitectureSubtopic(),
      createDataIndependenceSubtopic(),
      createKnowledgeCheckSubtopic(),
    ],
    quiz: createKnowledgeCheckSubtopic().quiz || [],
  };
}

function createConceptOfKeysTopic(): Topic {
  return {
    id: 'concept-of-keys',
    title: 'Concept Of Keys',
    content: 'Keys are fundamental in databases as they uniquely identify records, ensure data integrity, and establish relationships between tables. Without proper key management, data redundancy and inconsistencies can arise. There are various types of keys, each serving a specific purpose in relational database management systems (RDBMS).',
    subtopics: [
      createCandidateAndSuperKeySubtopic(),
      createPrimaryAndAlternateKeySubtopic(),
      createForeignKeySubtopic(),
      createAttributeClosureSubtopic(),
      createFunctionalDependencySubtopic(),
      createKnowledgeCheckSubtopicKeys(),
    ],
    quiz: createKnowledgeCheckSubtopicKeys().quiz || [],
  };
}

function createERDiagramTopic(): Topic {
    return {
      id: 'er diagram',
      title: 'ER Diagram',
      content: 'The Entity-Relationship (ER) Model is a high-level data model used to describe real-world objects (entities) and their relationships. It is commonly used in database design to provide a clear structure before implementing a database.',
      subtopics: [
        createERModelSubtopic(),
        createTypesOfAttributesSubtopic(),
        createRelationshipInERDiagramSubtopic(),
        createCardinalityRatioAndParticipatingConstraintsSubtopic(),
        createMappingRelationshipsSubtopic(),
        createSelfReferentialSubtopic(),
        createWeakEntitySubtopic(),
        createERModelKnowledgeCheck(),
      ],
      quiz: createERModelKnowledgeCheck().quiz || [],

    };
}

function createNormalizationTopic(): Topic {
    return {
      id: 'normalisation',
      title: 'Normalisation',
      content: 'The Entity-Relationship (ER) Model is a high-level data model used to describe real-world objects (entities) and their relationships. It is commonly used in database design to provide a clear structure before implementing a database.',
      subtopics: [
        createNormalizationSubtopic(),
        createCanonicalCoverSubtopic(),
        createEquivalenceOfFDsSubtopic(),
        createArmstrongAxiomsSubtopic(),
        createLosslessJoinDecompositionSubtopic(),
        createDependencyPreservingDecompositionSubtopic(),
        createFirstNormalFormSubtopic(),
        createSecondNormalFormSubtopic(),
        createThirdNormalFormSubtopic(),
        createBoyceCoddNormalFormSubtopic(),
        createHowToFindNormalFormSubtopic(),
        createHighestNormalFormSubtopic(),
        createKnowledgeCheckNormalizationSubtopic(),
      ],
      quiz: createKnowledgeCheckNormalizationSubtopic().quiz || [],

    };
}

function createRelationalAlgebraTopic(): Topic {
    return {
      id: 'relational-algebra',
      title: 'Relational Algebra',
      content: 'Relational algebra is a procedural language that allows us to query and manipulate data in a database. It is a powerful tool for working with relational databases and is used to perform a variety of operations on the data in a database.',

      subtopics: [
        createRelationalAlgebraSubtopic(),
        createSelectionProjectionSubtopic(),
        createUnionAndIntersectionSubtopic(),
        createCartesianProductSubtopic(),
        createRenameSetDifferenceOperatorsSubtopic(),
        createJoinsSubtopic(),
        createQueryTypesSubtopic(),
        createSetOperationsSubtopic(),
        createDivisionOperatorSubtopic(),
        createJoinTuplesMinMaxSubtopic(),
        createTupleRelationalCalculusSubtopic(),
        createKnowledgeCheckRelationalAlgebraSubtopic(),
      ],
      quiz: createKnowledgeCheckRelationalAlgebraSubtopic().quiz || [],


    };
}


const Sidebar: React.FC<{
  topics: Topic[];
  selectedTopic: string | null;
  setSelectedTopic: (id: string | null) => void;
  expandedTopics: string[];
  toggleTopic: (id: string) => void;
}> = ({ topics, selectedTopic, setSelectedTopic, expandedTopics, toggleTopic }) => {
  return (
    <div className="fixed w-64 h-full bg-white shadow-lg p-4 flex flex-col">
      <div className="mb-4">
        <br></br>
        <h2 className="text-xl font-bold text-gray-800">Contents</h2>
      </div>
      <div className="overflow-y-auto flex-1">
        {topics.map((topic) => (
          <div key={topic.id}>
            <div
              className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => toggleTopic(topic.id)}
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                <span>{topic.title}</span>
              </div>
              {expandedTopics.includes(topic.id) ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedTopics.includes(topic.id) &&
              topic.subtopics?.map((subtopic) => (
                <div
                  key={subtopic.id}
                  className={`ml-6 p-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                    selectedTopic === subtopic.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setSelectedTopic(subtopic.id)}
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  <span>{subtopic.title}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const ContentArea: React.FC<{ selectedTopic: Subtopic | null; topicQuizzes: QuizItem[] }> = ({
  selectedTopic,
  topicQuizzes,
}) => {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="ml-64 p-8">
      {selectedTopic ? (
        <div className="max-w-full">
          <h2 className="text-2xl font-bold mb-4">{selectedTopic.title}</h2>
          <div
            className="text-gray-700 mb-8"
            dangerouslySetInnerHTML={{ __html: selectedTopic.content }}
          />

          {(selectedTopic.id === 'knowledge-check' || selectedTopic.id === 'knowledge-check-keys' || selectedTopic.id === 'er-model-knowledge-check' || selectedTopic.id === 'knowledge-check-normalization' || selectedTopic.id === 'knowledge-check-relational-algebra') && (
            <button
              onClick={() => setShowQuiz(!showQuiz)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-8"
            >
              {showQuiz ? 'Hide Quiz' : 'Take Quiz'}
            </button>
          )}

          {showQuiz && (selectedTopic.id === 'knowledge-check' || selectedTopic.id === 'knowledge-check-keys' || selectedTopic.id === 'er-model-knowledge-check' || selectedTopic.id === 'knowledge-check-normalization' || selectedTopic.id === 'knowledge-check-relational-algebra') && (
            <Quiz questions={topicQuizzes} />
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          <Brain className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl">Select a topic from the sidebar to begin learning</h2>
        </div>
      )}
    </div>
  );
};

const Quiz: React.FC<{ questions: QuizItem[] }> = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswer = (selectedOption: number) => {
    setSelectedOption(selectedOption);
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-6 h-6 text-indigo-500" />
        <h2 className="text-2xl font-bold">Knowledge Check</h2>
      </div>

      {!showResults ? (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <p className="text-gray-700 mb-4">{questions[currentQuestion].question}</p>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedOption !== null
                      ? index === questions[currentQuestion].correctAnswer
                        ? 'bg-green-100 border-green-300'
                        : index === selectedOption
                        ? 'bg-red-100 border-red-300'
                        : 'border-gray-200'
                      : 'border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
          <p className="text-xl mb-6">
            Your score: {score} out of {questions.length}
          </p>
          <button
            onClick={resetQuiz}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default function Theory() {
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const currentSubtopic = topics
    .flatMap((topic) => topic.subtopics)
    .find((subtopic) => subtopic?.id === selectedSubtopic);

  const currentQuiz = currentSubtopic?.quiz || [];

  return (
    <div className="min-h-screen">
      <Sidebar
        topics={topics}
        selectedTopic={selectedSubtopic}
        setSelectedTopic={setSelectedSubtopic}
        expandedTopics={expandedTopics}
        toggleTopic={toggleTopic}
      />
      <ContentArea selectedTopic={currentSubtopic || null} topicQuizzes={currentQuiz} />
    </div>
  );
}